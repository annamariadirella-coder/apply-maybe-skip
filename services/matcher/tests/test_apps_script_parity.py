"""Prevent Python/Apps Script rubric, schema and decision drift (synthetic only)."""
import itertools
import json
from pathlib import Path
import subprocess
import unittest

from src.core import decide
from src.scoring import SCHEMA

ROOT = Path(__file__).resolve().parent.parent


class AppsScriptParityTests(unittest.TestCase):
    def test_merged_scoring_contract_and_verdicts(self):
        policy = json.loads((ROOT / 'context/policy.json').read_text())
        cases = []
        for kind, score, confidence, location, german, blocked in itertools.product(
            ['direct', 'transferable', 'unknown', 'gap'], [64, 65, 79, 80],
            [74, 75], ['compatible', 'unclear', 'incompatible'],
            ['required', 'unclear'], [False, True]
        ):
            cases.append({'score': score, 'confidence': confidence,
                          'requirements': [{'kind': kind, 'importance': 'must_have'}],
                          'checks': {k: {'value': v} for k, v in
                                     [('location', location), ('german', german),
                                      ('seniority', 'compatible'), ('compensation', 'unclear')]},
                          'blockers': [{'category': 'work_authorization'}] if blocked else []})
        script = """
const fs=require('fs'),vm=require('vm');const c=vm.createContext({});
for(const f of ['ScoringConfig.gs','Scoring.gs'])vm.runInContext(fs.readFileSync('apps-script/'+f,'utf8'),c);
c.cases=JSON.parse(fs.readFileSync(0,'utf8'));
process.stdout.write(vm.runInContext('JSON.stringify({schema:AI_SCORING_SCHEMA,policy:AI_SCORING_POLICY,prompt:AI_SCORING_PROMPT,decisions:cases.map(r=>aiDecision(r,AI_SCORING_POLICY))})',c));
"""
        out = subprocess.run(['node', '-e', script], input=json.dumps(cases),
                             text=True, capture_output=True, check=True, cwd=ROOT)
        result = json.loads(out.stdout)
        self.assertEqual(result['schema'], SCHEMA)
        self.assertEqual(result['policy'], policy)
        self.assertEqual(result['prompt'], (ROOT / 'prompts/fit_evaluation.md').read_text())
        expected = []
        for case in cases:
            decision = decide(case, policy)
            if decision == 'MAYBE' and case['score'] < policy['maybe_score_min']:
                decision = 'SKIP'
            expected.append(decision)
        self.assertEqual(result['decisions'], expected)
