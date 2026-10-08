"""Entirely fictional fixtures; do not reuse as candidate evidence."""
from copy import deepcopy
from src.daily_scan import ROOT, run
import json

JOB = {'provider': 'greenhouse', 'id': '101', 'board': {}, 'company': 'Fictional Example',
       'title': 'Senior Product Operations Lead', 'url': 'https://example.org/jobs/101',
       'location': 'Berlin', 'description': 'Lead operational planning. ' * 20}
RESULT = {'score': 82, 'decision': 'APPLY', 'business_problem': 'Scale operational planning.',
          'rationale': 'Synthetic evidence illustrates the output format.', 'scope': 'Senior lead',
          'cross_functional_scope': 'Product and Operations', 'domain': 'Fictional SaaS',
          'compensation_clues': 'Not disclosed', 'checks': {}, 'requirements': [], 'questions': []}


class MemoryDrive:
    def __init__(self):
        self.outputs = {}
        self.state = {'version': 1, 'processed': {}}

    def source(self, file_id):
        return ['Synthetic fictional example: Led operational planning for a fictional team.']

    def tracker(self):
        return [['Company', 'Role title', 'Source', 'Status'],
                ['Other Fictional Company', 'Other Role', 'https://example.org/jobs/99', 'Applied']]

    def read_state(self):
        return deepcopy(self.state)

    def write_output(self, name, content, mime=None):
        self.outputs[name] = content
        if name == 'processed_jobs.json':
            self.state = json.loads(content)


def demo_run():
    policy = json.loads((ROOT / 'context/policy.json').read_text(encoding='utf-8'))
    return run(MemoryDrive(), None, {'EVIDENCE_FILE_ID': 'example', 'CHARTER_FILE_ID': 'example',
               'OPENAI_MODEL': 'synthetic'}, policy,
               [{'provider': 'greenhouse', 'board': 'fictional'}],
               lambda *args: deepcopy(RESULT), lambda *args: [deepcopy(JOB)], lambda _, job: job)
