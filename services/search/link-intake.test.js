import assert from 'node:assert/strict';
import {test} from 'node:test';
import {intakeLink} from './link-intake.js';

test('HiringCafe links enter a verification queue without inventing employer data', () => {
  const lead = intakeLink('https://hiringcafe.com/jobs/fictional-role?utm_source=chatgpt', '2026-10-22T15:00:00Z');
  assert.equal(lead.url, 'https://hiringcafe.com/jobs/fictional-role');
  assert.equal(lead.source_kind, 'hiringcafe');
  assert.equal(lead.detected_provider, null);
  assert.equal(lead.requires_employer_verification, true);
  assert.equal(lead.employer_live_verified, false);
});

test('known employer ATS links expose only the provider hint', () => {
  const lead = intakeLink('https://job-boards.eu.greenhouse.io/fictional/jobs/123?gh_jid=123', '2026-10-22T15:00:00Z');
  assert.equal(lead.source_kind, 'employer_ats');
  assert.equal(lead.detected_provider, 'greenhouse');
  assert.equal(lead.status, 'awaiting_employer_source');
});

test('unknown links remain reviewable and unsafe links are rejected', () => {
  assert.equal(intakeLink('https://careers.fictional.example/jobs/123').source_kind, 'unknown');
  assert.throws(() => intakeLink('javascript:alert(1)'));
});
