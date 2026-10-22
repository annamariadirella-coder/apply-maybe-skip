import test from 'node:test';
import assert from 'node:assert/strict';
import {intakeLink} from './link-intake.js';
import {verifyEmployerSource} from './link-verify.js';

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
