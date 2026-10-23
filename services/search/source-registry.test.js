import test from 'node:test';
import assert from 'node:assert/strict';
import {discoverSourceLead, mergeSourceRegistry} from './source-registry.js';

test('discovers ATS source leads without a manual company catalog entry', () => {
  const lead = discoverSourceLead('https://jobs.ashbyhq.com/ceezer/f869a94d-3868-4a46-8a16-7ad3757998c2', '2026-10-23T10:00:00Z');
  assert.deepEqual(lead, {provider:'ashby',url:'https://jobs.ashbyhq.com/ceezer/f869a94d-3868-4a46-8a16-7ad3757998c2',discovered_at:'2026-10-23T10:00:00Z',status:'awaiting_validation',verified:false});
});

test('merges discovered sources and preserves the first discovery date', () => {
  const old = {provider:'ashby',url:'https://jobs.ashbyhq.com/ceezer',discovered_at:'2026-10-20T10:00:00Z',status:'verified',verified:true};
  const merged = mergeSourceRegistry([old], [{provider:'ashby',url:old.url,discovered_at:'2026-10-23T10:00:00Z',status:'awaiting_validation',verified:false}]);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].discovered_at, old.discovered_at);
  assert.equal(merged[0].status, 'awaiting_validation');
});

test('discovers Career Ops provider families from employer URLs without a company catalog', () => {
  assert.deepEqual(discoverSourceLead('https://acme.wd5.myworkdayjobs.com/en-US/acme','2026-10-23T15:00:00Z'),
    {provider:'workday',url:'https://acme.wd5.myworkdayjobs.com/en-US/acme',discovered_at:'2026-10-23T15:00:00Z',status:'awaiting_validation',verified:false});
  assert.deepEqual(discoverSourceLead('https://jobs.example.successfactors.eu/search/','2026-10-23T15:00:00Z'),
    {provider:'successfactors',url:'https://jobs.example.successfactors.eu/search/',discovered_at:'2026-10-23T15:00:00Z',status:'awaiting_validation',verified:false});
});
