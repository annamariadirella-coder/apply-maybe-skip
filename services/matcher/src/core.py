"""Pure filters, identities, evidence validation and decisions."""
import hashlib
import json
import re
import unicodedata
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, ensure_ascii=False).encode()).hexdigest()


def normalize(value):
    value = unicodedata.normalize('NFKC', value).casefold()
    return re.sub(r'\s+', ' ', value).strip()


def canonical_url(url):
    p = urlsplit(url.strip())
    if p.scheme not in ('http', 'https') or not p.hostname:
        raise ValueError('Invalid job URL')
    ignored = {'source', 'ref', 'refid', 'trackingid', 'gh_src', 'pid', 'lever-source', 'language'}
    query = sorted((k, v) for k, v in parse_qsl(p.query) if not k.startswith('utm_') and k.lower() not in ignored)
    path = re.sub(r'/(application|apply)/?$', '', p.path).rstrip('/')
    return urlunsplit(('https', p.netloc.lower(), path, urlencode(query), ''))


def vacancy_id(url):
    p = urlsplit(canonical_url(url))
    q = dict(parse_qsl(p.query))
    for key in ('gh_jid', 'ashby_jid'):
        if key in q:
            return ('greenhouse' if key == 'gh_jid' else 'ashby') + ':' + q[key]
    if 'greenhouse.io' in p.hostname:
        m = re.search(r'/jobs/(\d+)', p.path)
        if m:
            return 'greenhouse:' + m[1]
    if 'ashbyhq.com' in p.hostname:
        return 'ashby:' + p.path.split('/')[-1]
    if 'lever.co' in p.hostname:
        return 'lever:' + p.path.split('/')[-1]
    return ''


def identities(job):
    keys = {canonical_url(job['url']), 'role:' + normalize(job['company']) + '|' + normalize(job['title'])}
    vid = vacancy_id(job['url'])
    if vid:
        keys.add(vid)
    if job.get('provider') and job.get('id'):
        keys.add(job['provider'] + ':' + str(job['id']))
    return keys


def tracker_keys(rows):
    if not rows:
        raise ValueError('Empty tracker')
    aliases = {'company': {'company', 'unternehmen'}, 'title': {'role title', 'role', 'position'},
               'url': {'source', 'url', 'quelle', 'job url'}, 'status': {'status'}}
    header = None
    for i, row in enumerate(rows[:5]):
        cols = {key: next((j for j, cell in enumerate(row) if normalize(str(cell)) in names), None)
                for key, names in aliases.items()}
        if all(v is not None for v in cols.values()):
            header = i
            break
    if header is None:
        raise ValueError('Tracker columns not recognized; require company, role, source/URL, status')
    result = set()
    for row in rows[header + 1:]:
        fields = {key: str(row[j]).strip() if j < len(row) else '' for key, j in cols.items()}
        if normalize(fields['company']) in aliases['company']:
            continue
        if not fields['company'] and not fields['title']:
            continue
        if not fields['company'] or not fields['title']:
            raise ValueError('Incomplete tracker identity')
        result.add('role:' + normalize(fields['company']) + '|' + normalize(fields['title']))
        urls = re.findall(r'https?://[^\s<>]+', fields['url'])
        for url in urls:
            result.add(canonical_url(url))
            if vacancy_id(url):
                result.add(vacancy_id(url))
    return result


def prefilter(job, policy):
    title = normalize(job['title'])
    if any(re.search(p, title) for p in policy['excluded_junior_patterns']):
        return 'Clearly junior scope'
    text = title + ' ' + normalize(job['description'])
    if not any(term in text for term in policy['role_terms']):
        return 'Outside configured role families'
    location = normalize(job['location'])
    if re.search(r'\bremote\s*[-–:,(/ ]*\s*(us|usa|united states|canada|uk|united kingdom)\s*(only|exclusively)\b', location):
        return 'Explicit remote eligibility outside Germany'
    return ''


def priority(job, policy):
    return sum(term in normalize(job['title']) for term in policy['role_terms'] + policy['senior_terms'])


def evidence_chunks(paragraphs):
    chunks = {}
    for paragraph in paragraphs:
        text = paragraph.strip()
        if not text or re.search(r'\S+@\S+|(?:api[_ -]?key|private[_ -]?key)|https?://', text, re.I):
            continue
        chunks['ev_' + digest(text)[:16]] = text
    if not chunks:
        raise ValueError('No usable evidence')
    return chunks


def validate_assessment(result, evidence, job, charter=()):
    jd = job['title'] + '\n' + job['location'] + '\n' + job['description']
    if not result['requirements']:
        raise ValueError('No requirement mapping')
    if sum(result['dimension_scores'].values()) != result['score']:
        raise ValueError('Dimension scores must add up to total score')
    for item in result['requirements']:
        if not item['jd_quote'] or item['jd_quote'] not in jd:
            raise ValueError('Unsupported requirement quote')
        if item['kind'] == 'unknown':
            if item['evidence_id'] or item['evidence_quote']:
                raise ValueError('Unknown cannot claim evidence')
        else:
            source = evidence.get(item['evidence_id'], '')
            if not item['evidence_quote'] or item['evidence_quote'] not in source:
                raise ValueError('Unsupported evidence citation')
    for key, check in result['checks'].items():
        inconclusive = check['value'] == 'unclear'
        if not inconclusive and (not check['jd_quote'] or check['jd_quote'] not in jd):
            raise ValueError('Unsupported eligibility conclusion')
    pay = result['checks']['compensation']
    if pay['value'] == 'incompatible':
        if not pay.get('charter_quote') or not any(pay['charter_quote'] in p for p in charter):
            raise ValueError('Compensation blocker needs current Charter threshold')
    unknown_must = [r for r in result['requirements'] if r['kind'] == 'unknown' and r['importance'] == 'must_have']
    if unknown_must and not result['questions']:
        raise ValueError('Unknown must-have needs a factual question')
    for blocker in result['blockers']:
        if not blocker['reason']:
            raise ValueError('Blocker reason required')


def decide(result, policy):
    checks = result['checks']
    if checks['german']['value'] == 'required' and not policy['mandatory_professional_german_allowed']:
        return 'SKIP'
    if any(checks[k]['value'] == 'incompatible' for k in ('location', 'seniority', 'compensation')):
        return 'SKIP'

    must = [r for r in result['requirements'] if r['importance'] == 'must_have']
    if any(r['kind'] == 'gap' for r in must):
        return 'SKIP'

    critical_unknown = any(r['kind'] == 'unknown' for r in must)
    needs_input = any(b['category'] in {
        'needs_candidate_input', 'legal_or_sensitive', 'work_authorization',
        'account_or_login', 'salary_input', 'insufficient_evidence'
    } for b in result['blockers'])
    if critical_unknown or needs_input:
        return 'BLOCKED'

    if any(r['kind'] == 'transferable' for r in must):
        return 'MAYBE'
    if any(checks[k]['value'] == 'unclear' for k in ('location', 'seniority')):
        return 'MAYBE'
    if result['score'] < policy['apply_score_min']:
        return 'MAYBE'
    if result['confidence'] < policy['apply_confidence_min']:
        return 'MAYBE'
    return 'APPLY'
