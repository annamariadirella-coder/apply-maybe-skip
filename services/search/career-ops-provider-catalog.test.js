import test from 'node:test';
import assert from 'node:assert/strict';
import {CAREER_OPS_PROVIDER_FAMILIES, providerFamilyCoverage} from './career-ops-provider-catalog.js';

test('catalogue is provider-family based and never an employer list', () => {
  assert.ok(CAREER_OPS_PROVIDER_FAMILIES.includes('greenhouse'));
  assert.ok(CAREER_OPS_PROVIDER_FAMILIES.includes('workday'));
  assert.ok(!CAREER_OPS_PROVIDER_FAMILIES.some(name => name.includes('ceezer')));
});

test('coverage report identifies missing provider families', () => {
  const report = providerFamilyCoverage(['Greenhouse', 'Workday', 'unknown']);
  assert.deepEqual(report.covered, ['greenhouse', 'workday']);
  assert.ok(report.missing.includes('ashby'));
  assert.equal(report.coverage_ratio, 2 / CAREER_OPS_PROVIDER_FAMILIES.length);
});
