import json
import unittest
from copy import deepcopy
from unittest.mock import patch

from src.collect import eligible, run_collect
from src.daily_scan import ROOT, REQUIRED, config_from_env
from src.demo import JOB, MemoryDrive


class CollectTests(unittest.TestCase):
    def setUp(self):
        self.policy = json.loads((ROOT / 'context/policy.json').read_text(encoding='utf-8'))
        self.drive = MemoryDrive()
        self.config = {'EVIDENCE_FILE_ID': 'example', 'CHARTER_FILE_ID': 'example'}
        self.boards = [{'provider': 'greenhouse', 'board': 'example'}]

    def scan(self, jobs=None, validator=None):
        return run_collect(self.drive, None, self.config, self.policy, self.boards,
                           lambda *a: deepcopy(jobs if jobs is not None else [JOB]),
                           validator or (lambda _, j: j))

    def test_no_fake_fit_or_discard_list(self):
        report = self.scan()
        self.assertFalse(report['fit_assessed'])
        self.assertEqual(len(report['candidates']), 1)
        self.assertNotIn('decision', report['candidates'][0])
        self.assertNotIn('shortlist', report)
        self.assertNotIn('assessments', report)

    def test_no_openai_config_needed(self):
        with patch.dict('os.environ', {k: 'synthetic' for k in REQUIRED}, clear=True):
            self.assertNotIn('OPENAI_API_KEY', config_from_env())

    def test_foreign_remote_unclear_and_generic_product_excluded(self):
        for job in [dict(JOB, location='Remote'), dict(JOB, location='London'),
                    dict(JOB, title='Senior Product Manager')]:
            self.assertFalse(eligible(job, self.policy))

    def test_german_required_excluded_preference_retained(self):
        self.assertFalse(eligible(dict(JOB, description='German fluency is required'), self.policy))
        self.assertTrue(eligible(dict(JOB, description='German fluency is a plus'), self.policy))

    def test_pending_revalidated_not_lost_next_day(self):
        self.scan()
        self.assertEqual(len(self.scan(jobs=[])['candidates']), 1)
        self.assertEqual(len(self.scan(jobs=[], validator=lambda *a: None)['candidates']), 0)

    def test_tracker_removes_pending(self):
        self.scan()
        self.drive.tracker = lambda: [['Company', 'Role title', 'Source', 'Status'],
                                     [JOB['company'], JOB['title'], JOB['url'], 'Applied']]
        self.assertEqual(len(self.scan()['candidates']), 0)
        self.assertFalse(self.drive.state['pending_review'])

    def test_failed_validation_remains_retryable(self):
        def fail(*a):
            raise TimeoutError()
        self.assertEqual(self.scan(validator=fail)['coverage'], 'partial')
        self.assertEqual(len(self.scan()['candidates']), 1)
