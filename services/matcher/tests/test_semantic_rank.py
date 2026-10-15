import copy
import unittest
from src.semantic_rank import rank_packet, cosine, query_for, document_for


class FakeModel:
    def encode_query(self, texts, **kwargs):
        return [[1.0, 0.0] for _ in texts]

    def encode_document(self, texts, **kwargs):
        return [[1.0, 0.0] if 'operations' in text else [0.0, 1.0] for text in texts]


class SemanticTests(unittest.TestCase):
    def test_attaches_ranking_without_changing_verdict_or_inputs(self):
        packet = {'candidates': [{'title': 'operations', 'location': 'Berlin',
                   'description': 'x '*500, 'scoring': {'decision': 'BLOCKED'},
                   'employer_live_verified': False}]}
        before = copy.deepcopy(packet)
        settings = {'configured': True, 'targetRoles': ['operations']}
        result = rank_packet(packet, settings, FakeModel(), 'fixture-v1')
        self.assertEqual(packet, before)
        job = result['candidates'][0]
        self.assertEqual(job['semantic']['score'], 1.0)
        self.assertEqual(job['semantic']['query'], query_for(settings))
        self.assertEqual(job['semantic']['document'], document_for(job))
        self.assertEqual(job['scoring']['decision'], 'BLOCKED')
        self.assertFalse(job['employer_live_verified'])

    def test_invalid_vectors_and_configuration(self):
        for a, b in [([], []), ([0, 0], [1, 0]), ([1], [1, 2]), ([float('nan')], [1])]:
            with self.assertRaises(ValueError):
                cosine(a, b)
        with self.assertRaises(ValueError):
            rank_packet({'candidates': []}, {}, FakeModel(), 'fixture')
        self.assertAlmostEqual(cosine([1, 0], [-1, 0]), -1)

    def test_unicode_query_matches_javascript_json_contract(self):
        self.assertEqual(query_for({'targetRoles': ['Stratégie']}),
                         '{"targetRoles":["Stratégie"],"potentialRoles":[],"strengths":[]}')


if __name__ == '__main__':
    unittest.main()
