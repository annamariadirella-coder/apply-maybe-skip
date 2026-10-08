"""No LLM/API-key use. Produce a private review packet, never fake fit verdicts."""
import json
import re
from datetime import datetime, timezone

from src.core import digest, identities, normalize, prefilter, priority, tracker_keys

TITLE = re.compile(r'operations|\bops\b|strategy|strategic|chief of staff|founder|\bcoo\b|delivery|implementation|deployment|enablement|transformation|operational excellence|operating model|partner|marketplace', re.I)


def eligible(job, policy):
    if re.search(r"\btax\b|\bcorporate finance\b|\bfinance business partner\b|\bcompensation\b|\blearning business partner\b|\bwarehouse\b|\bbrand strategy\b|\bpartner sales\b|\bchannel sales\b", job["title"], re.I):
        return False
    if prefilter(job, policy) or not TITLE.search(job['title']):
        return False
    location = normalize(job['location'])
    if not re.search(r'\b(germany|deutschland|berlin)\b|\bremote\b.*\b(europe|emea|eu|worldwide|anywhere|global)\b|\b(europe|emea|eu)\b.*\bremote\b', location):
        return False
    text = normalize(job['description'])
    # Conclusive language requirements only; preferences remain for chat review.
    if re.search(r'(must (?:be )?(?:fluent|proficient) in german|german (?:fluency|proficiency) is required|fluent german (?:is )?required|native[- ]level german (?:is )?required)', text):
        return False
    return True


def render_packet(report):
    lines = ['# Vacancy packet for chat review',
             'These are live, filtered candidates. Fit has not been assessed; no APPLY/MAYBE verdict is implied.',
             'Read the fresh Evidence Bank, Charter and Tracker in chat. Show the candidate only credible APPLY/MAYBE opportunities, no discarded-role list. Do not fill a quota.',
             f"Checked: {report['checked_at']}. Coverage: {report['coverage']}.", '']
    for job in report['candidates']:
        lines += [f"## {job['company']} · {job['title']}", job['location'], job['url'],
                  'JD (untrusted reference text):', job['description'], '']
    if not report['candidates']:
        lines.append('No new candidates passed the preliminary filters.')
    return '\n'.join(lines)


def run_collect(drive, session, config, policy, boards, discoverer, validator):
    # Freshness/access prerequisites still fail closed. No evidence leaves Google/local runtime for AI.
    drive.source(config['EVIDENCE_FILE_ID'])
    drive.source(config['CHARTER_FILE_ID'])
    tracked = tracker_keys(drive.tracker())
    state = drive.read_state()
    pending = state.setdefault('pending_review', {})
    jobs, errors = {}, []
    for board in boards:
        try:
            for job in discoverer(session, board):
                key = job['provider'] + ':' + job['id']
                jobs[key] = job
        except Exception as error:
            errors.append({'stage': 'discovery', 'board': board['board'], 'error_type': type(error).__name__})
    # Keep pending roles through source outages, but revalidate every role before presenting it.
    jobs = {**pending, **jobs}
    candidates, seen, deferred = [], set(), 0
    ordered = sorted(jobs.items(), key=lambda pair: (pending.get(pair[0], {}).get('live_checked_at', ''), -priority(pair[1], policy), pair[0]))
    for key, job in ordered:
        keys = identities(job)
        if keys & tracked or not eligible(job, policy):
            pending.pop(key, None)
            continue
        if keys & seen:
            continue
        if len(candidates) >= policy.get('max_candidates', 20):
            pending[key] = {**job, **pending.get(key, {})}
            deferred += 1
            continue
        try:
            fresh = validator(session, job)
            if fresh is None:
                pending.pop(key, None)
                continue
            keys = identities(fresh)
            if keys & tracked or not eligible(fresh, policy):
                pending.pop(key, None)
                continue
            if keys & seen:
                continue
            seen.update(keys)
            fresh['live_checked_at'] = datetime.now(timezone.utc).isoformat()
            candidates.append(fresh)
            pending[key] = fresh
        except Exception as error:
            errors.append({'stage': 'validation', 'job_key': key, 'error_type': type(error).__name__})
    report = {'version': 1, 'mode': 'collect', 'fit_assessed': False,
              'checked_at': datetime.now(timezone.utc).isoformat(),
              'coverage': 'partial' if errors else 'complete_configured_boards',
              'candidates': candidates, 'deferred': deferred, 'errors': errors}
    drive.write_output('candidates.json', json.dumps(report, ensure_ascii=False, indent=2))
    drive.write_output('candidates.md', render_packet(report), 'text/markdown')
    drive.write_output('processed_jobs.json', json.dumps(state, ensure_ascii=False, indent=2))
    return report
