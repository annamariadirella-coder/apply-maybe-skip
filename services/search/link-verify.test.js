import test from 'node:test';
import assert from 'node:assert/strict';
import {intakeLink} from './link-intake.js';
import {verifyEmployerSource,verifyProviderPayload} from './link-verify.js';

test('HiringCafe lead can be moved to a known employer source for live checking', () => {
  const lead = intakeLink('https://hiring.cafe/job/123?utm_source=x', '2026-10-22T12:00:00Z');
  const verified = verifyEmployerSource(lead, 'https://boards.greenhouse.io/acme/jobs/9', '2026-10-22T12:30:00Z');
  assert.equal(verified.source_kind, 'employer_source');
  assert.equal(verified.provider, 'greenhouse');
  assert.equal(verified.status, 'awaiting_live_check');
  assert.equal(verified.source_url, 'https://hiring.cafe/job/123');
});

test('a second HiringCafe link is rejected as an employer source', () => {
  const lead = intakeLink('https://hiring.cafe/job/123');
  assert.throws(() => verifyEmployerSource(lead, 'https://hiring.cafe/job/123'), /must leave HiringCafe/);
});

test('new public ATS families are classified without adding employers manually', () => {
  for (const [url, provider] of [
    ['https://acme.wd5.myworkdayjobs.com/en-US/acme/job/berlin/Operations-Lead_R123', 'workday'],
    ['https://jobs.example.successfactors.eu/job/123', 'successfactors'],
    ['https://example.oraclecloud.com/hcmUI/CandidateExperience/en/sites/Careers/job/123', 'oraclecloud']
  ]) {
    const lead = intakeLink(url, '2026-10-23T15:00:00Z');
    assert.equal(lead.detected_provider, provider);
    const checked = verifyEmployerSource(lead, url, '2026-10-23T15:01:00Z');
    assert.equal(checked.provider, provider);
    assert.equal(checked.status, 'awaiting_live_check');
  }
});

test('provider verification keeps incomplete pages out of verified results', () => {
  const source = {provider:'workday',url:'https://acme.wd5.myworkdayjobs.com/en-US/acme',company:'Acme'};
  const checked = verifyProviderPayload(source, {total:2,jobPostings:[{title:'Ops Lead',externalPath:'/job/ops_R1'}]}, '2026-10-23T15:02:00Z');
  assert.equal(checked.status,'incomplete');
  assert.equal(checked.employer_live_verified,false);
  assert.equal(checked.completeness.total,2);
});
