import json
import unittest
from copy import deepcopy

from src.core import canonical_url, decide, evidence_chunks, identities, prefilter, tracker_keys, validate_assessment
from src.daily_scan import ROOT, run
from src.demo import JOB, RESULT, MemoryDrive


def assessment(kind='direct'):
    return {'score': 85, 'confidence': 90,
            'dimension_scores': {'business_problem_fit': 25, 'seniority_ownership': 18, 'functional_fit': 13,
                                 'location_work_model': 9, 'domain_fit': 8, 'scope_compensation': 12},
            'blockers': [], 'checks': {key: {'value': value, 'jd_quote': 'Berlin'} for key, value in
            [('location', 'compatible'), ('seniority', 'compatible'), ('compensation', 'unclear'), ('german', 'unclear')]},
            'requirements': [{'requirement': 'planning', 'importance': 'must_have', 'kind': kind,
                              'jd_quote': 'Lead operational planning.', 'evidence_id': 'ev_test',
                              'evidence_quote': 'Led planning', 'explanation': 'Verified'}], 'questions': []}


class CoreTests(unittest.TestCase):
    def setUp(self):
        self.policy = json.loads((ROOT / 'context/policy.json').read_text(encoding='utf-8'))

    def test_tracking_parameters_removed_job_ids_preserved(self):
        self.assertEqual(canonical_url('https://example.org/job/?utm_source=x&gh_jid=123#apply'),
                         'https://example.org/job?gh_jid=123')
        self.assertNotEqual(canonical_url('https://example.org/job?gh_jid=123'),
                            canonical_url('https://example.org/job?gh_jid=124'))

    def test_cross_host_greenhouse_identity(self):
        a = dict(JOB, url='https://job-boards.eu.greenhouse.io/acme/jobs/123?gh_src=a')
        b = dict(JOB, url='https://careers.example.org/vacancy?gh_jid=123', title='Changed title')
        self.assertTrue(identities(a) & identities(b))

    def test_lever_application_suffix(self):
        self.assertEqual(canonical_url('https://jobs.lever.co/acme/123/apply'), 'https://jobs.lever.co/acme/123')

    def test_all_tracker_statuses_suppress_only_same_role(self):
        for status in ['Applied', 'Rejected', 'Withdrawn', 'Processed', 'Waiting', '']:
            keys = tracker_keys([['Company', 'Role title', 'Source', 'Status'],
                                 [JOB['company'], JOB['title'], JOB['url'], status]])
            self.assertTrue(identities(JOB) & keys)
            self.assertFalse(identities(dict(JOB, id='102', title='Director of Strategy', url='https://example.org/jobs/102')) & keys)

    def test_bilingual_tracker(self):
        keys = tracker_keys([['Company', 'Role title', 'Source', 'Status'],
                             ['Unternehmen', 'Position', 'Quelle', 'Status'],
                             ['Example', 'Head of Ops', 'https://example.org/123', 'Rejected']])
        self.assertIn('role:example|head of ops', keys)

    def test_tracker_fail_closed(self):
        for rows in [[], [['Notes']], [['Company', 'Role title', 'Source', 'Status'], ['Company only']]]:
            with self.assertRaises(ValueError):
                tracker_keys(rows)

    def test_junior_exclusion(self):
        self.assertTrue(prefilter(dict(JOB, title='Operations Intern'), self.policy))

    def test_manager_and_adjacent_business_problem_retained(self):
        self.assertFalse(prefilter(dict(JOB, title='Customer Experience Manager'), self.policy))

    def test_contact_lines_removed(self):
        chunks = evidence_chunks(['name@example.org', 'Synthetic professional evidence'])
        self.assertEqual(list(chunks.values()), ['Synthetic professional evidence'])

    def test_exact_citation_valid(self):
        validate_assessment(assessment(), {'ev_test': 'Led planning for a team.'}, JOB)

    def test_invented_source_quote_rejected(self):
        with self.assertRaises(ValueError):
            validate_assessment(assessment(), {'ev_test': 'Collaborated only.'}, JOB)

    def test_invented_jd_quote_rejected(self):
        result = assessment()
        result['requirements'][0]['jd_quote'] = 'Owned fundraising'
        with self.assertRaises(ValueError):
            validate_assessment(result, {'ev_test': 'Led planning'}, JOB)

    def test_unknown_must_have_needs_question(self):
        result = assessment('unknown')
        result['requirements'][0].update(evidence_id='', evidence_quote='')
        with self.assertRaises(ValueError):
            validate_assessment(result, {}, JOB)
        result['questions'] = ['Have you led operational planning?']
        validate_assessment(result, {}, JOB)

    def test_direct_apply_transferable_unknown_maybe_gap_skip(self):
        for kind, verdict in [('direct', 'APPLY'), ('transferable', 'MAYBE'), ('unknown', 'BLOCKED'), ('gap', 'SKIP')]:
            self.assertEqual(decide(assessment(kind), self.policy), verdict)

    def test_explicit_german_blocker(self):
        result = assessment()
        result['checks']['german']['value'] = 'required'
        self.assertEqual(decide(result, self.policy), 'SKIP')

    def test_unclear_location_caps_apply(self):
        result = assessment()
        result['checks']['location']['value'] = 'unclear'
        self.assertEqual(decide(result, self.policy), 'MAYBE')

    def test_low_score_alone_is_not_skip_at_decision_stage(self):
        result = assessment()
        result['score'] = 70
        result['dimension_scores']['business_problem_fit'] -= 15
        self.assertEqual(decide(result, self.policy), 'MAYBE')

    def test_low_confidence_caps_apply(self):
        result = assessment()
        result['confidence'] = 50
        self.assertEqual(decide(result, self.policy), 'MAYBE')

    def test_explicit_candidate_input_blocks(self):
        result = assessment()
        result['blockers'] = [{'category': 'salary_input', 'reason': 'Candidate salary expectation required'}]
        self.assertEqual(decide(result, self.policy), 'BLOCKED')


class OrchestratorTests(unittest.TestCase):
    def setUp(self):
        self.drive = MemoryDrive()
        self.policy = json.loads((ROOT / 'context/policy.json').read_text(encoding='utf-8'))
        self.config = {'EVIDENCE_FILE_ID': 'example', 'CHARTER_FILE_ID': 'example', 'OPENAI_MODEL': 'synthetic'}
        self.boards = [{'provider': 'greenhouse', 'board': 'fictional'}]

    def scan(self, **kwargs):
        return run(self.drive, None, self.config, self.policy, self.boards,
                   kwargs.get('evaluator', lambda *a: deepcopy(RESULT)),
                   kwargs.get('discoverer', lambda *a: [deepcopy(JOB)]),
                   kwargs.get('validator', lambda _, job: job))

    def test_persistent_dedup(self):
        self.assertEqual(len(self.scan()['shortlist']), 1)
        self.assertEqual(len(self.scan()['shortlist']), 0)

    def test_changed_evidence_reconsiders(self):
        self.scan()
        self.drive.source = lambda _: ['Changed synthetic professional evidence']
        self.assertEqual(len(self.scan()['shortlist']), 1)

    def test_closed_not_scored(self):
        report = self.scan(validator=lambda *a: None)
        self.assertEqual(report['evaluated'], 0)
        self.assertEqual(report['counts']['closed'], 1)

    def test_ai_failure_retryable_and_partial(self):
        def fail(*a):
            raise ValueError('Sensitive detail must never enter report')
        report = self.scan(evaluator=fail)
        self.assertEqual(report['coverage'], 'partial')
        self.assertFalse(self.drive.state['processed'])
        self.assertNotIn('Sensitive detail', json.dumps(report))
        self.assertEqual(len(self.scan()['shortlist']), 1)

    def test_tracker_failure_no_ai_or_writes(self):
        self.drive.tracker = lambda: []
        with self.assertRaises(ValueError):
            self.scan(evaluator=lambda *a: self.fail('AI must not run'))
        self.assertFalse(self.drive.outputs)

    def test_report_write_failure_no_state_commit(self):
        original = self.drive.write_output
        def fail(name, *args):
            if name == 'shortlist.md':
                raise ValueError('Write failed')
            original(name, *args)
        self.drive.write_output = fail
        with self.assertRaises(ValueError):
            self.scan()
        self.assertFalse(self.drive.state['processed'])

    def test_shortlist_cap_leaves_unpresented_retryable(self):
        self.policy['shortlist_size'] = 1
        jobs = [dict(JOB, id=str(i), title=f'Senior Operations Lead {i}', url=f'https://example.org/jobs/{i}') for i in range(3)]
        report = self.scan(discoverer=lambda *a: jobs)
        self.assertEqual(len(report['shortlist']), 1)
        self.assertEqual(report['deferred'], 2)
        self.assertEqual(len(self.drive.state['processed']), 1)

    def test_board_failure_exposed(self):
        def fail(*a):
            raise TimeoutError()
        report = self.scan(discoverer=fail)
        self.assertEqual(report['coverage'], 'partial')
        self.assertEqual(report['errors'][0]['stage'], 'discovery')


if __name__ == '__main__':
    unittest.main()
