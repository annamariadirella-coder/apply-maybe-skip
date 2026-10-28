import assert from 'node:assert/strict';
import {test} from 'node:test';
import {publicJobsFromCollectorReport, upsertCollectorReport} from './collector.js';

const verified = {company:'Fictional Acme',title:'Operations Lead',location:'Berlin',url:'https://jobs.example/acme/1',provider:'greenhouse',description:'A complete employer description.',employer_live_verified:true,requires_employer_verification:false};

test('collector adapter keeps verified public roles and drops private evaluation fields', () => {
  const [job] = publicJobsFromCollectorReport({checked_at:'2026-10-22T12:00:00Z',candidates:[{...verified,scoring:{private_score:99},status:'Applied',notes:'private note'}, {...verified,url:'https://jobs.example/acme/lead',employer_live_verified:false,requires_employer_verification:true}]});
  assert.equal(job.last_seen_at,'2026-10-22T12:00:00Z');
  assert.equal(job.scoring,null); assert.equal(job.status,undefined); assert.equal(job.notes,undefined);
});

test('collector upsert preserves public history across reports', () => {
  const first = {checked_at:'2026-10-20T12:00:00Z',candidates:[verified]};
  const second = {checked_at:'2026-10-22T12:00:00Z',candidates:[{...verified,description:'Updated employer description.'}]};
  const index = upsertCollectorReport(upsertCollectorReport([],first),second);
  assert.equal(index.length,1); assert.equal(index[0].first_seen_at,'2026-10-20T12:00:00Z'); assert.equal(index[0].last_seen_at,'2026-10-22T12:00:00Z');
});
