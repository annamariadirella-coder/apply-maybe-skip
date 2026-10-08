"""One orchestrator. Run: python -m src.daily_scan [--demo]."""
import argparse
import json
import os
from datetime import datetime, timezone
from pathlib import Path

from src.core import digest, evidence_chunks, identities, prefilter, priority, tracker_keys

ROOT = Path(__file__).resolve().parent.parent
REQUIRED = ('GOOGLE_CREDENTIALS_JSON', 'EVIDENCE_FILE_ID', 'CHARTER_FILE_ID',
            'TRACKER_SHEET_ID', 'TRACKER_RANGE', 'OUTPUT_FOLDER_ID')


def config_from_env(mode='collect'):
    required = REQUIRED + (('OPENAI_API_KEY', 'OPENAI_MODEL') if mode == 'ai' else ())
    missing = [key for key in required if not os.environ.get(key) or os.environ[key].startswith('<')]
    if missing:
        raise ValueError('Missing configuration: ' + ', '.join(missing))
    return {key: os.environ[key] for key in required}


def render(report):
    def clean(value):
        return str(value).replace('\n', ' ').replace('<', '&lt;').replace('>', '&gt;')
    summary = report.get('summary', {})
    lines = [f"# Shortlist — {report['checked_at']}",
             f"Coverage: {report['coverage']}. Scanned: {summary.get('scanned', 0)}. New: {summary.get('new', 0)}. "
             f"Deduplicated/excluded: {summary.get('deduplicated_or_excluded', 0)}. Below threshold: {summary.get('below_threshold', 0)}. "
             f"APPLY: {summary.get('apply', 0)}. MAYBE: {summary.get('maybe', 0)}. BLOCKED: {summary.get('blocked', 0)}.",
             f"New evaluated: {report['evaluated']}. Deferred: {report['deferred']}.",
             'Scores are internal fit scores, not ATS scores or interview probabilities. Live status was checked at scan time.', '']
    for item in report['shortlist']:
        lines += [f"## {item['decision']} · {clean(item['company'])} · {clean(item['title'])} ({item['score']}/100 · confidence {item.get('confidence', 0)}%)",
                  f"{clean(item['location'])} — {item['url']}",
                  f"Problem: {clean(item['business_problem'])}", f"Why: {clean(item['rationale'])}"]
        for symbol, kind in [('✓', 'direct'), ('△', 'transferable'), ('?', 'unknown'), ('✗', 'gap')]:
            matches = [r for r in item['requirements'] if r['kind'] == kind]
            for r in matches[:2]:
                proof = r['evidence_quote'] if kind in ('direct', 'transferable', 'gap') else r['explanation']
                lines.append(f"{symbol} {clean(r['requirement'])}: {clean(proof)}")
        for blocker in item.get('blockers', []):
            lines.append(f"BLOCKED: {clean(blocker['reason'])}")
        lines += [f"Question: {clean(q)}" for q in item['questions']]
        lines.append('')
    if not report['shortlist']:
        lines += ['No new verified APPLY/MAYBE roles. No quota is filled with weak matches.']
    if report['errors']:
        lines += ['', 'Some boards or evaluations failed; failed jobs remain retryable.']
    return '\n'.join(lines)


def run(drive, session, config, policy, boards, evaluator, discoverer, validator):
    checked_at = datetime.now(timezone.utc).isoformat()
    evidence = evidence_chunks(drive.source(config['EVIDENCE_FILE_ID']))
    charter = list(evidence_chunks(drive.source(config['CHARTER_FILE_ID'])).values())
    # Fatal prerequisite failures propagate before discovery/AI/state writes.
    tracked = tracker_keys(drive.tracker())
    state = drive.read_state()
    context_hash = digest({'evidence': evidence, 'charter': charter, 'policy': policy,
                           'model': config['OPENAI_MODEL'],
                           'prompt': (ROOT / 'prompts/fit_evaluation.md').read_text(encoding='utf-8')})
    errors, candidates, seen = [], [], set()
    counts = {'scanned': 0, 'tracked': 0, 'filtered': 0, 'deduplicated': 0, 'processed': 0, 'closed': 0}
    for board in boards:
        try:
            for job in discoverer(session, board):
                counts['scanned'] += 1
                keys = identities(job)
                if keys & tracked:
                    counts['tracked'] += 1
                    continue
                if keys & seen:
                    counts['deduplicated'] += 1
                    continue
                seen.update(keys)
                if prefilter(job, policy):
                    counts['filtered'] += 1
                    continue
                candidates.append(job)
        except Exception as error:
            errors.append({'stage': 'discovery', 'provider': board['provider'],
                           'board': board['board'], 'error_type': type(error).__name__})
    evaluated, assessments, deferred = 0, [], 0
    candidates.sort(key=lambda j: (-priority(j, policy), digest(sorted(identities(j)))))
    for job in candidates:
        key = job['provider'] + ':' + job['id']
        jd_hash = digest({k: job[k] for k in ('title', 'location', 'description')})
        previous = state['processed'].get(key, {})
        if previous.get('jd_hash') == jd_hash and previous.get('context_hash') == context_hash:
            counts['processed'] += 1
            continue
        recommended = sum(r['decision'] in ('APPLY', 'MAYBE', 'BLOCKED') for r in assessments)
        if evaluated >= policy['max_ai_jobs'] or recommended >= policy['shortlist_size']:
            deferred += 1
            continue
        try:
            fresh = validator(session, job)
            if fresh is None:
                counts['closed'] += 1
                continue
            # Recheck identities and filters if the posting changed during discovery.
            if identities(fresh) & tracked or prefilter(fresh, policy):
                continue
            evaluated += 1
            assessment = evaluator(session, config, fresh, evidence, charter, policy)
            record = {k: fresh[k] for k in ('company', 'title', 'url', 'location', 'provider', 'id')}
            record.update(assessment)
            record['live_checked_at'] = datetime.now(timezone.utc).isoformat()
            assessments.append(record)
            state['processed'][key] = {'jd_hash': digest({k: fresh[k] for k in ('title', 'location', 'description')}),
                                       'context_hash': context_hash, 'decision': assessment['decision'],
                                       'checked_at': checked_at}
        except Exception as error:
            errors.append({'stage': 'validation_or_scoring', 'job_key': key,
                           'error_type': type(error).__name__})
    rank = {'APPLY': 0, 'MAYBE': 1, 'BLOCKED': 2}
    shortlist = sorted((r for r in assessments if r['decision'] in rank),
                       key=lambda r: (rank[r['decision']], -r['score'], -r.get('confidence', 0), r['company'], r['title']))[:policy['shortlist_size']]
    summary = {
        'scanned': counts['scanned'],
        'new': len(candidates),
        'deduplicated_or_excluded': counts['tracked'] + counts['filtered'] + counts['deduplicated'] + counts['processed'] + counts['closed'],
        'below_threshold': sum(r['decision'] == 'SKIP' and r['score'] < policy['maybe_score_min'] for r in assessments),
        'apply': sum(r['decision'] == 'APPLY' for r in assessments),
        'maybe': sum(r['decision'] == 'MAYBE' for r in assessments),
        'blocked': sum(r['decision'] == 'BLOCKED' for r in assessments),
    }
    report = {'version': 2, 'checked_at': checked_at, 'coverage': 'partial' if errors else 'complete_configured_boards',
              'evaluated': evaluated, 'deferred': deferred, 'counts': counts, 'summary': summary,
              'shortlist': shortlist, 'assessments': assessments, 'errors': errors}
    # Commit state only after both report formats have been saved successfully.
    drive.write_output('shortlist.json', json.dumps(report, ensure_ascii=False, indent=2))
    drive.write_output('shortlist.md', render(report), 'text/markdown')
    drive.write_output('processed_jobs.json', json.dumps(state, indent=2))
    return report


def demo():
    from src.demo import demo_run
    report = demo_run()
    directory = ROOT / 'output'
    directory.mkdir(exist_ok=True)
    (directory / 'demo.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    (directory / 'demo.md').write_text(render(report), encoding='utf-8')
    print('Synthetic demo completed. No network, real evidence, credentials or AI calls used.')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--demo', action='store_true')
    args = parser.parse_args()
    if args.demo:
        demo()
        return 0
    if os.environ.get('AGENT_ENABLED', 'false').lower() != 'true':
        print('Live scan disabled. Set AGENT_ENABLED=true after configuring secrets.')
        return 0
    try:
        import requests
        from src.drive import Drive
        from src.providers import discover, validate_live
        mode = os.environ.get('AGENT_MODE', 'collect')
        if mode not in ('collect', 'ai'):
            raise ValueError('Unknown agent mode')
        if mode == 'ai' and os.environ.get('ALLOW_PAID_AI') != 'true':
            raise ValueError('Paid AI is disabled; explicit opt-in required')
        config = config_from_env(mode)
        policy = json.loads((ROOT / 'context/policy.json').read_text(encoding='utf-8'))
        policy['max_ai_jobs'] = min(100, max(1, int(os.environ.get('MAX_AI_JOBS', policy['max_ai_jobs']))))
        policy['shortlist_size'] = min(8, max(1, int(os.environ.get('SHORTLIST_SIZE', policy['shortlist_size']))))
        boards = json.loads((ROOT / 'context/boards.json').read_text(encoding='utf-8'))
        if not boards:
            raise ValueError('No configured boards')
        if mode == 'collect':
            from src.collect import run_collect
            report = run_collect(Drive(config), requests.Session(), config, policy, boards, discover, validate_live)
            print(f"Collection complete: {len(report['candidates'])} candidates for chat review, {len(report['errors'])} errors. No AI calls.")
        else:
            from src.scoring import assess
            report = run(Drive(config), requests.Session(), config, policy, boards, assess, discover, validate_live)
            print(f"Scan complete: {report['evaluated']} evaluated, {len(report['shortlist'])} shortlisted, {len(report['errors'])} errors.")
        return 1 if report['errors'] else 0
    except Exception as error:
        # Never print exception bodies, HTTP responses, credentials, source text or candidate data.
        print('Scan failed safely: ' + type(error).__name__ + '. Check configuration/access; no credentials are logged.')
        return 1


if __name__ == '__main__':
    raise SystemExit(main())
