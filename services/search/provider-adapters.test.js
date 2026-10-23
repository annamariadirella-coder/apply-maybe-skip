import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveWorkdayEndpoint,parseWorkdayResponse,parseSuccessFactorsTiles,parseIcmsJobs,parseSoftgardenResponse,parsePersonioXml,parseBamboohrResponse,parseJobviteJobs,parseOracleResponse,parseProviderResponse,fetchProviderPage,fetchWorkdayPages,resolveOracleSite,buildOracleEndpoint,fetchOraclePages,fetchIcmsPages} from './provider-adapters.js';

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

test('parses iCIMS job cards from the public HTML board', () => {
  const html = '<li class="iCIMS_JobCardItem"><span class="sr-only field-label">Job Locations</span><span> Berlin, Germany</span><a href="https://careers-acme.icims.com/jobs/123/ops/job"><h3>Operations Lead</h3></a></li>';
  const result = parseIcmsJobs(html, 'https://careers-acme.icims.com', 'Acme');
  assert.equal(result.jobs[0].title, 'Operations Lead');
  assert.equal(result.jobs[0].location, 'Berlin, Germany');
  assert.equal(result.jobs[0].provider, 'icims');
});

test('parses Softgarden schema.org feed items', () => {
  const result = parseSoftgardenResponse({dataFeedElement:[{item:{'@type':'JobPosting',title:'Product Operations Lead',url:'/jobs/abc',jobLocation:{address:{addressLocality:'Berlin'}},datePosted:'2026-10-23'}}]}, 'https://acme.career.softgarden.de', 'Acme');
  assert.equal(result.jobs[0].title, 'Product Operations Lead');
  assert.equal(result.jobs[0].location, 'Berlin');
  assert.equal(result.jobs[0].provider, 'softgarden');
});

test('parses Personio XML, BambooHR JSON and Jobvite cards', () => {
  assert.equal(parsePersonioXml('<position><name>Ops Lead</name><jobAdUrl>https://acme.jobs.personio.de/job/1</jobAdUrl><office>Berlin</office></position>', 'https://acme.jobs.personio.de').jobs[0].title, 'Ops Lead');
  assert.equal(parseBamboohrResponse({result:[{jobOpeningName:'Ops Lead',jobOpeningShareUrl:'/careers/1',jobOpeningLocation:'Remote'}]}, 'https://acme.bamboohr.com').jobs[0].location, 'Remote');
  assert.equal(parseJobviteJobs('<li class="job"><a class="job-title" href="/job/1">Ops Lead</a></li>', 'https://jobs.jobvite.com/acme').jobs[0].title, 'Ops Lead');
});

test('parses Oracle results and flags a short page', () => {
  const result = parseOracleResponse({totalResults:2,items:[{title:'Chief of Staff',requisitionId:'123',location:'Berlin'}]}, 'https://acme.oraclecloud.com', 'Acme');
  assert.equal(result.complete,false);
  assert.match(result.jobs[0].url,/job\/123$/);
});

test('resolves an Oracle Cloud career page and its public API endpoint', () => {
  const site = resolveOracleSite('https://eoja.fa.ap1.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1/jobs');
  assert.deepEqual(site, {host:'eoja.fa.ap1.oraclecloud.com',lang:'en',siteNumber:'CX_1'});
  assert.match(buildOracleEndpoint(site, 0, 2), /recruitingCEJobRequisitions/);
  assert.equal(resolveOracleSite('https://example.com/jobs'), null);
});

test('parses the real Oracle requisition-list shape', () => {
  const result = parseOracleResponse({items:[{TotalJobsCount:2,requisitionList:[{Id:77,Title:'Ops Lead',PrimaryLocation:'Berlin'}]}]}, {host:'eoja.fa.ap1.oraclecloud.com',lang:'en',siteNumber:'CX_1'}, 'Example');
  assert.equal(result.jobs[0].title, 'Ops Lead');
  assert.match(result.jobs[0].url, /sites\/CX_1\/job\/77$/);
  assert.equal(result.total, 2);
  assert.equal(result.complete, false);
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

test('SuccessFactors keeps the career path when building the tile endpoint', async () => {
  let requested;
  await fetchProviderPage({provider:'successfactors',url:'https://api2.successfactors.eu/career?company=Mindray',company:'Mindray'}, async (url) => {
    requested = url;
    return {ok:true,text:async()=>'<li class="job-tile"><a class="jobTitle-link" href="/job/1">Operations Lead</a></li>'};
  });
  assert.equal(requested,'https://api2.successfactors.eu/career/tile-search-results/?startrow=0');
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

test('Workday total zero with postings remains uncertain', () => {
  const result = parseWorkdayResponse({total:0,jobPostings:[{title:'Ops Lead',externalPath:'/job/ops_R1'}]}, 'https://acme.wd5.myworkdayjobs.com/en-US/acme', 'Acme');
  assert.equal(result.total,null);
});

test('Oracle pagination is bounded and uses the public JSON endpoint', async () => {
  const calls = [];
  const result = await fetchOraclePages({provider:'oraclecloud',url:'https://eoja.fa.ap1.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1/jobs',company:'Example'}, {
    maxPages:2,
    fetchImpl:async (url) => { calls.push(url); return {ok:true,json:async()=>({items:[{TotalJobsCount:1,requisitionList:[{Id:1,Title:'Ops Lead'}]}]})}; }
  });
  assert.equal(calls.length, 1);
  assert.equal(result.complete, true);
  assert.equal(result.jobs[0].provider, 'oraclecloud');
});

test('iCIMS pagination stops on an empty page', async () => {
  const calls = [];
  const result = await fetchIcmsPages({provider:'icims',url:'https://careers-acme.icims.com/jobs/search',company:'Acme'}, {
    maxPages:3,
    fetchImpl:async (url) => { calls.push(url); return {ok:true,text:async()=> calls.length === 1 ? '<li class="iCIMS_JobCardItem"><a href="/jobs/1/x/job"><h3>Ops Lead</h3></a></li>' : ''}; }
  });
  assert.equal(calls.length, 2);
  assert.equal(result.complete, true);
  assert.equal(result.jobs.length, 1);
});

test('Softgarden uses the public feed endpoint', async () => {
  let requested;
  const result = await fetchProviderPage({provider:'softgarden',url:'https://acme.career.softgarden.de/en/jobs',company:'Acme'}, async (url) => {
    requested = url;
    return {ok:true,json:async()=>({dataFeedElement:[{title:'Ops Lead',url:'/jobs/1'}]})};
  });
  assert.equal(requested, 'https://acme.career.softgarden.de/jobs.feed.json');
  assert.equal(result.jobs.length, 1);
});
