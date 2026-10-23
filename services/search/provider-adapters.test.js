import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveWorkdayEndpoint,parseWorkdayResponse,parseSuccessFactorsTiles,parseOracleResponse,parseProviderResponse,fetchProviderPage,fetchWorkdayPages} from './provider-adapters.js';

test('resolves a Workday CXS endpoint from a public career URL', () => {
  assert.equal(resolveWorkdayEndpoint('https://acme.wd5.myworkdayjobs.com/en-US/acme'), 'https://acme.wd5.myworkdayjobs.com/wday/cxs/acme/acme/jobs');
  assert.equal(resolveWorkdayEndpoint('https://example.com/jobs'), null);
});

test('keeps Workday first pages explicitly incomplete', () => {
  const result = parseWorkdayResponse({total:2,jobPostings:[{title:'Ops Lead',externalPath:'/job/de/ops_R1',locationsText:'Berlin'}]}, 'https://acme.wd5.myworkdayjobs.com/en-US/acme', 'Acme');
  assert.equal(result.status,'incomplete');
  assert.equal(result.complete,false);
  assert.equal(result.jobs[0].url,'https://acme.wd5.myworkdayjobs.com/job/de/ops_R1');
});

test('parses SuccessFactors tiles without claiming missing totals', () => {
  const result = parseSuccessFactorsTiles('<li class="job-tile"><a class="jobTitle-link" href="/job/1">Operations Lead</a></li>', 'https://jobs.acme.successfactors.eu', 'Acme');
  assert.equal(result.status,'ok');
  assert.equal(result.jobs[0].title,'Operations Lead');
});

test('parses Oracle results and flags a short page', () => {
  const result = parseOracleResponse({totalResults:2,items:[{title:'Chief of Staff',requisitionId:'123',location:'Berlin'}]}, 'https://acme.oraclecloud.com', 'Acme');
  assert.equal(result.complete,false);
  assert.match(result.jobs[0].url,/job\/123$/);
});

test('routes provider payloads through one verification contract', () => {
  const result = parseProviderResponse('workday', {total:0,jobPostings:[]}, 'https://acme.wd5.myworkdayjobs.com/en-US/acme', 'Acme');
  assert.equal(result.status, 'ok');
  assert.throws(() => parseProviderResponse('unknown', {}, 'https://example.com'), /Unsupported provider/);
});

test('live provider fetch is bounded, HTTPS-only and parser-backed', async () => {
  const calls = [];
  const result = await fetchProviderPage({provider:'workday',url:'https://acme.wd5.myworkdayjobs.com/en-US/acme',company:'Acme'}, async (url, options) => {
    calls.push({url,options});
    return {ok:true,json:async()=>({total:1,jobPostings:[{title:'Ops Lead',externalPath:'/job/ops_R1'}]})};
  });
  assert.equal(result.status,'ok');
  assert.equal(calls.length,1);
  assert.equal(calls[0].options.redirect,'error');
  await assert.rejects(() => fetchProviderPage({provider:'workday',url:'http://acme.wd5.myworkdayjobs.com/en-US/acme'}), /HTTPS/);
});

test('Workday pagination is bounded and stops when the total is reached', async () => {
  const calls = [];
  const result = await fetchWorkdayPages({provider:'workday',url:'https://acme.wd5.myworkdayjobs.com/en-US/acme',company:'Acme'}, {
    maxPages:3,
    fetchImpl:async (url, options) => {
      calls.push(JSON.parse(options.body).offset);
      const offset = JSON.parse(options.body).offset;
      return {ok:true,json:async()=>({total:3,jobPostings:offset === 0 ? [{title:'A',externalPath:'/a'},{title:'B',externalPath:'/b'}] : [{title:'C',externalPath:'/c'}]})};
    }
  });
  assert.deepEqual(calls,[0,20]);
  assert.equal(result.jobs.length,3);
  assert.equal(result.complete,true);
});
