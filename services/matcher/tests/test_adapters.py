import io
import json
import unittest
import zipfile
from copy import deepcopy
from unittest.mock import Mock, patch

import jsonschema
import requests

from src.drive import docx_paragraphs
from src.providers import discover, job_from, plain, validate_live
from src.scoring import SCHEMA, assess
from src.demo import JOB
from src.core import prefilter, validate_assessment
from src.daily_scan import ROOT


class AdapterTests(unittest.TestCase):
    @patch('src.providers.request')
    def test_ashby_public_listing_and_closed_posting(self, request):
        board = {'provider': 'ashby', 'board': 'fictional', 'company': 'Example'}
        raw = {'isListed': True, 'title': 'Head of Operations',
               'jobUrl': 'https://jobs.ashbyhq.com/fictional/abc', 'location': 'Berlin',
               'descriptionPlain': 'A' * 250}
        request.return_value.json.return_value = {'jobs': [raw, dict(raw, isListed=False)]}
        jobs = discover(None, board)
        self.assertEqual(len(jobs), 1)
        self.assertEqual(validate_live(None, jobs[0])['id'], 'abc')
        request.return_value.json.return_value = {'jobs': []}
        self.assertIsNone(validate_live(None, jobs[0]))

    def test_docx_preserves_table_and_body_paragraphs(self):
        stream = io.BytesIO()
        with zipfile.ZipFile(stream, 'w') as z:
            z.writestr('word/document.xml', '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Evidence</w:t></w:r></w:p><w:tbl><w:tr><w:tc><w:p><w:r><w:t>Limitation</w:t></w:r></w:p></w:tc></w:tr></w:tbl></w:body></w:document>')
        self.assertEqual(docx_paragraphs(stream.getvalue()), ['Evidence', 'Limitation'])

    def test_encoded_html(self):
        self.assertEqual(plain('&lt;p&gt;Product &amp; Operations&lt;/p&gt;'), 'Product & Operations')

    def test_prospect_excluded(self):
        self.assertIsNone(job_from({'internal_job_id': None}, {'provider': 'greenhouse'}))

    @patch('src.providers.request')
    def test_lever_pagination(self, request):
        raw = {'id': 'x', 'text': 'Operations', 'hostedUrl': 'https://example.org/x'}
        request.side_effect = [Mock(json=lambda: [raw] * 100), Mock(json=lambda: [raw])]
        jobs = discover(None, {'provider': 'lever', 'board': 'fictional', 'company': 'Example'})
        self.assertEqual(len(jobs), 101)
        self.assertEqual(request.call_args.kwargs['params']['skip'], 100)

    @patch('src.providers.request')
    def test_closed_detail(self, request):
        response = Mock(status_code=404)
        request.side_effect = requests.HTTPError(response=response)
        job = dict(JOB, board={'provider': 'greenhouse', 'board': 'fictional'})
        self.assertIsNone(validate_live(None, job))

    @patch('src.providers.request')
    def test_http200_wrong_id_rejected(self, request):
        request.return_value.json.return_value = {'id': '999'}
        with self.assertRaises(RuntimeError):
            validate_live(None, dict(JOB, board={'provider': 'greenhouse', 'board': 'fictional'}))

    def test_schema_valid(self):
        jsonschema.Draft202012Validator.check_schema(SCHEMA)

    def test_explicit_remote_us_only_filtered(self):
        policy = json.loads((ROOT / 'context/policy.json').read_text(encoding='utf-8'))
        self.assertTrue(prefilter(dict(JOB, location='Remote - US only'), policy))
        self.assertFalse(prefilter(dict(JOB, location='Remote - Europe'), policy))

    @patch('src.scoring.request')
    def test_refusal_and_incomplete_rejected(self, request):
        for body in [{'status': 'incomplete'}, {'status': 'completed', 'output': [{'content': [{'type': 'refusal'}]}]}]:
            request.return_value.json.return_value = body
            with self.assertRaises(ValueError):
                assess(None, {'OPENAI_API_KEY': 'synthetic', 'OPENAI_MODEL': 'synthetic'}, JOB, {}, [], {})
        self.assertFalse(request.call_args.kwargs['json']['store'])


if __name__ == '__main__':
    unittest.main()
