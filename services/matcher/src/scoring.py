"""Responses structured output, exact source citations, deterministic verdict."""
import json
from pathlib import Path

import jsonschema

from src.core import decide, validate_assessment
from src.providers import request


def obj(properties):
    return {'type': 'object', 'properties': properties, 'required': list(properties), 'additionalProperties': False}


def enum(*values):
    return {'type': 'string', 'enum': list(values)}


STRING = {'type': 'string'}
CHECK = lambda values: obj({'value': enum(*values), 'jd_quote': STRING})
SCHEMA = obj({
    'score': {'type': 'integer', 'minimum': 0, 'maximum': 100},
    'confidence': {'type': 'integer', 'minimum': 0, 'maximum': 100},
    'dimension_scores': obj({
        'business_problem_fit': {'type': 'integer', 'minimum': 0, 'maximum': 30},
        'seniority_ownership': {'type': 'integer', 'minimum': 0, 'maximum': 20},
        'functional_fit': {'type': 'integer', 'minimum': 0, 'maximum': 15},
        'location_work_model': {'type': 'integer', 'minimum': 0, 'maximum': 10},
        'domain_fit': {'type': 'integer', 'minimum': 0, 'maximum': 10},
        'scope_compensation': {'type': 'integer', 'minimum': 0, 'maximum': 15},
    }),
    'business_problem': STRING, 'rationale': STRING,
    'scope': STRING, 'cross_functional_scope': STRING, 'domain': STRING, 'compensation_clues': STRING,
    'checks': obj({
        'location': CHECK(('compatible', 'incompatible', 'unclear')),
        'german': CHECK(('required', 'not_required', 'unclear')),
        'seniority': CHECK(('compatible', 'incompatible', 'unclear')),
        'compensation': obj({'value': enum('compatible', 'incompatible', 'unclear'),
                             'jd_quote': STRING, 'charter_quote': STRING}),
    }),
    'requirements': {'type': 'array', 'items': obj({
        'requirement': STRING, 'importance': enum('must_have', 'preference', 'responsibility'),
        'kind': enum('direct', 'transferable', 'unknown', 'gap'),
        'jd_quote': STRING, 'evidence_id': STRING, 'evidence_quote': STRING, 'explanation': STRING,
    })},
    'blockers': {'type': 'array', 'items': obj({
        'category': enum('needs_candidate_input', 'legal_or_sensitive', 'work_authorization',
                         'account_or_login', 'salary_input', 'insufficient_evidence'),
        'reason': STRING,
    })},
    'questions': {'type': 'array', 'items': STRING, 'maxItems': 2},
})


def assess(session, config, job, evidence, charter, policy):
    prompt = (Path(__file__).resolve().parent.parent / 'prompts/fit_evaluation.md').read_text(encoding='utf-8')
    payload = {'job': {k: job[k] for k in ('company', 'title', 'location', 'description')},
               'evidence': evidence, 'charter': charter, 'policy': policy}
    body = request(session, 'POST', 'https://api.openai.com/v1/responses',
                   headers={'Authorization': 'Bearer ' + config['OPENAI_API_KEY']},
                   json={'model': config['OPENAI_MODEL'], 'store': False, 'instructions': prompt,
                         'input': json.dumps(payload, ensure_ascii=False), 'max_output_tokens': 7000,
                         'text': {'format': {'type': 'json_schema', 'name': 'fit_assessment',
                                             'strict': True, 'schema': SCHEMA}}}).json()
    if body.get('status') != 'completed':
        raise ValueError('Incomplete model response')
    blocks = [block for item in body.get('output', []) for block in item.get('content', [])]
    if any(block.get('type') == 'refusal' for block in blocks):
        raise ValueError('Model refused')
    result = json.loads(''.join(block['text'] for block in blocks if block.get('type') == 'output_text'))
    jsonschema.validate(result, SCHEMA)
    validate_assessment(result, evidence, job, charter)
    result['decision'] = decide(result, policy)
    if result['decision'] == 'MAYBE' and result['score'] < policy['maybe_score_min']:
        result['decision'] = 'SKIP'
    return result
