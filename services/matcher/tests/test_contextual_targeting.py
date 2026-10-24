"""Fictional mandate reviews; no network or private candidate data."""
import itertools
import json
import subprocess
import unittest
from copy import deepcopy
from unittest.mock import patch

import jsonschema
from test_core import assessment
from src.core import decide, validate_assessment, contextual_dimensions, prefilter
from src.collect import eligible
from src.daily_scan import ROOT
from src.demo import JOB
from src.scoring import CONTEXTUAL_SCHEMA, assess


def review(kind='transferable', conclusion='priority'):
    r = assessment(kind)
    r.update(business_problem='Improve workflows', rationale='Comparable planning outcomes', scope='Senior',
             cross_functional_scope='Product and Service', domain='Fictional technology', compensation_clues='Published')
    r['checks']['compensation'].update(value='compatible', charter_quote='')
    r['checks']['german']['value'] = 'not_required'
    r['requirements'][0].update(central=True, bridge_status='credible' if kind == 'transferable' else 'not_applicable')
    r['mandate_review'] = {'conclusion': conclusion, 'rationale': 'Principal workflow mandate has a cited, comparable planning bridge.'}
    if kind == 'unknown':
        r['requirements'][0].update(evidence_id='', evidence_quote='')
        r['questions'] = ['Have you owned comparable operational planning?']
    if kind == 'gap':
        r['requirements'][0].update(evidence_quote='Did not own planning', evidence_id='ev_gap')
    return r


EVIDENCE = {'ev_test': 'Led planning for a fictional service team.', 'ev_gap': '✗ Did not own planning for this specialist function.'}


class ContextualTests(unittest.TestCase):
    def setUp(self):
        self.policy = json.loads((ROOT / 'context/policy.json').read_text())
        self.policy['targeting_mode'] = 'contextual'

    def test_transferable_central_bridge_can_be_priority_without_score_gate(self):
        r = review()
        r['score'] = 20
        r['confidence'] = 20
        r['dimension_scores'] = {k: 0 for k in r['dimension_scores']}
        r['dimension_scores']['business_problem_fit'] = 20
        jsonschema.validate(r, CONTEXTUAL_SCHEMA)
        validate_assessment(r, EVIDENCE, JOB)
        self.assertEqual(decide(r, self.policy), 'APPLY')
        self.assertTrue(all(x['kind'] == 'transferable' for x in r['requirements']))

    def test_unknown_practical_condition_preserves_professional_priority(self):
        r = review()
        r['checks']['location']['value'] = 'unclear'
        self.assertEqual(decide(r, self.policy), 'MAYBE')
        self.assertEqual(contextual_dimensions(r)['professional_priority'], 'priority')
        self.assertEqual(contextual_dimensions(r)['eligibility'], 'unknown')

    def test_central_unknown_is_visible_for_clarification(self):
        r = review('unknown', 'unknown')
        validate_assessment(r, EVIDENCE, JOB)
        self.assertEqual(decide(r, self.policy), 'MAYBE')
        self.assertEqual(contextual_dimensions(r)['professional_priority'], 'to_clarify')

    def test_noncredible_transferability_cannot_be_priority(self):
        r = review()
        r['requirements'][0]['bridge_status'] = 'unclear'
        with self.assertRaises(ValueError):
            validate_assessment(r, EVIDENCE, JOB)

    def test_unsuitable_requires_explicit_central_essential_gap(self):
        r = review('direct', 'unsuitable')
        with self.assertRaises(ValueError):
            validate_assessment(r, EVIDENCE, JOB)
        r = review('gap', 'unsuitable')
        validate_assessment(r, EVIDENCE, JOB)
        self.assertEqual(decide(r, self.policy), 'SKIP')

    def test_supporting_gap_does_not_suppress_motivated_exploration(self):
        r = review('direct', 'exploratory')
        extra = deepcopy(review('gap', 'unsuitable')['requirements'][0])
        extra['central'] = False
        r['requirements'].append(extra)
        validate_assessment(r, EVIDENCE, JOB)
        self.assertEqual(decide(r, self.policy), 'MAYBE')

    def test_practical_blocker_and_human_steps_remain_separate(self):
        for field, value in [('german', 'required'), ('location', 'incompatible')]:
            r = review()
            r['checks'][field]['value'] = value
            self.assertEqual(decide(r, self.policy), 'SKIP')
        r = review()
        r['blockers'] = [{'category': 'account_or_login', 'reason': 'Candidate controls the account'}]
        self.assertEqual(decide(r, self.policy), 'BLOCKED')
        self.assertEqual(contextual_dimensions(r)['professional_priority'], 'priority')

    def test_restricted_or_uncited_evidence_never_becomes_a_positive_bridge(self):
        r = review()
        r['requirements'][0].update(evidence_id='ev_gap', evidence_quote='Did not own planning')
        with self.assertRaises(ValueError):
            validate_assessment(r, EVIDENCE, JOB)
        r = review()
        r['requirements'][0]['evidence_quote'] = 'Invented ownership'
        with self.assertRaises(ValueError):
            validate_assessment(r, EVIDENCE, JOB)

    def test_discovery_keeps_unknown_locations_and_adjacent_titles(self):
        for title in ['Warehouse Systems Partner', 'Director Revenue Operations', 'Junior Strategy Partner', 'Organisational Systems Partner']:
            j = dict(JOB, title=title, location='Remote', description='Coordinate workflows across teams.')
            self.assertEqual(prefilter(j, self.policy), '')
            self.assertTrue(eligible(j, self.policy))
        self.assertFalse(eligible(dict(JOB, location='Remote US only'), self.policy))

    @patch('src.scoring.request')
    def test_orchestrator_uses_contextual_schema_and_does_not_reapply_legacy_cutoff(self, request):
        r = review('direct')
        r['score'] = 20
        r['confidence'] = 20
        r['dimension_scores'] = {k: 0 for k in r['dimension_scores']}
        r['dimension_scores']['business_problem_fit'] = 20
        request.return_value.json.return_value = {'status': 'completed', 'output': [{'content': [{'type': 'output_text', 'text': json.dumps(r)}]}]}
        result = assess(None, {'OPENAI_API_KEY': 'synthetic', 'OPENAI_MODEL': 'synthetic'}, JOB, EVIDENCE, [], self.policy)
        self.assertEqual(result['decision'], 'APPLY')
        self.assertEqual(result['review_dimensions']['professional_priority'], 'priority')
        self.assertEqual(request.call_args.kwargs['json']['text']['format']['schema'], CONTEXTUAL_SCHEMA)

    def test_python_and_apps_script_contextual_decisions_and_schema_match(self):
        cases = []
        for kind, conclusion, score, location in itertools.product(
                ['direct', 'transferable', 'unknown', 'gap'],
                ['priority', 'exploratory', 'unsuitable', 'unknown'], [20, 95], ['compatible', 'unclear', 'incompatible']):
            r = review(kind, conclusion)
            r['score'] = score
            r['checks']['location']['value'] = location
            cases.append(r)
        script = """
const fs=require('fs'),vm=require('vm'),c=vm.createContext({});
for(const f of ['ScoringConfig.gs','Scoring.gs','Code.gs'])vm.runInContext(fs.readFileSync('apps-script/'+f,'utf8'),c);
c.input=JSON.parse(fs.readFileSync(0,'utf8'));
process.stdout.write(vm.runInContext(`JSON.stringify({schema:AI_CONTEXTUAL_SCHEMA,decisions:input.cases.map(r=>aiDecision(r,input.policy)),discovery:exclusionReason({title:'Warehouse Systems Partner',location:'Remote',description:'Coordinate workflows'},'contextual')})`,c));
"""
        result = subprocess.run(['node', '-e', script], input=json.dumps({'cases': cases, 'policy': self.policy}), text=True, capture_output=True, check=True, cwd=ROOT)
        actual = json.loads(result.stdout)
        self.assertEqual(actual['schema'], CONTEXTUAL_SCHEMA)
        self.assertEqual(actual['decisions'], [decide(r, self.policy) for r in cases])
        self.assertIsNone(actual['discovery'])
