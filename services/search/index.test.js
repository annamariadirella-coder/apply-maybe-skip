import assert from 'node:assert/strict';
import {test} from 'node:test';
import {normalizePublicJob, upsertPublicJobs, searchPublicJobs, publicIndexStats} from './index.js';

const base = {company:'Fictional Acme', title:'Product Operations Lead', location:'Berlin, Germany', url:'https://jobs.example/acme/42?utm_source=test', provider:'greenhouse', description:'Lead product operations across teams.', workplace_type:'Hybrid', published_at:'2026-10-20'};

test('normalizes a public employer posting and strips tracking parameters', () => {
  const job = normalizePublicJob({...base, salary:{min:90000,max:110000,currency:'EUR',period:'year',disclosed:true}}, '2026-10-22');
  assert.equal(job.url, 'https://jobs.example/acme/42');
  assert.equal(job.source_url, job.url);
  assert.equal(job.workplace_type, 'hybrid');
  assert.equal(job.salary.disclosed, true);
});

test('upsert keeps the original first-seen date and one record per public URL', () => {
  const first = normalizePublicJob(base, '2026-10-20');
  const second = {...base, title:'Product Operations Lead — updated', last_seen_at:'2026-10-22'};
  const index = upsertPublicJobs([first], [second], '2026-10-22');
  assert.equal(index.length, 1);
  assert.equal(index[0].first_seen_at, '2026-10-20');
  assert.equal(index[0].title, 'Product Operations Lead — updated');
});

test('search combines query, location, workplace and disclosed salary filters', () => {
  const index = upsertPublicJobs([], [
    {...base, salary:{min:90000,max:110000,currency:'EUR',period:'year',disclosed:true}},
    {...base, title:'Operations Manager', url:'https://jobs.example/acme/43', location:'Remote Europe', workplace_type:'Remote', salary:null},
    {...base, company:'Fictional Beta', url:'https://jobs.example/beta/1', location:'Munich, Germany', workplace_type:'Onsite', salary:{min:80000,max:85000,currency:'EUR',period:'year',disclosed:true}}
  ], '2026-10-22');
  assert.equal(searchPublicJobs(index,{query:'product operations',location:'Berlin',workplace_type:'hybrid',min_salary:100000}).length, 1);
  assert.equal(searchPublicJobs(index,{workplace_type:'remote'}).length, 1);
});

test('stats describe the public index without exposing personal state', () => {
  const index = upsertPublicJobs([], [base, {...base, url:'https://jobs.example/beta/1', company:'Fictional Beta', active:false}], '2026-10-22');
  assert.deepEqual(publicIndexStats(index), {total:2,active:1,employers:1,providers:['greenhouse'],with_disclosed_salary:0});
});
