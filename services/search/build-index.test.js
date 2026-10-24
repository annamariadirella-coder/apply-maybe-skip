import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {buildPublicIndex} from './build-index.js';

test('buildPublicIndex combines only verified collector candidates', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'jobops-index-'));
  const path = join(dir, 'report.json');
  await writeFile(path, JSON.stringify({checked_at:'2026-10-22T10:00:00Z', candidates:[
    {company:'Acme', title:'Operations Lead', location:'Remote Europe', url:'https://acme.example/jobs/1', employer_live_verified:true, requires_employer_verification:false},
    {company:'Lead', title:'Unverified', location:'Remote', url:'https://lead.example/jobs/2', employer_live_verified:false}
  ]}));
  const index = await buildPublicIndex([path]);
  assert.equal(index.length, 1);
  assert.equal(index[0].company, 'Acme');
  assert.equal(index[0].first_seen_at, '2026-10-22T10:00:00Z');
});
