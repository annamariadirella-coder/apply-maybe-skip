import test from 'node:test';
import assert from 'node:assert/strict';
import {scanPublicSources} from './source-scan.js';

test('public source scan normalizes jobs and keeps per-source diagnostics', async () => {
  const result = await scanPublicSources([
    {provider:'softgarden',url:'https://acme.career.softgarden.de/',company:'Acme'},
    {provider:'softgarden',url:'https://down.career.softgarden.de/',company:'Down'}
  ], {checkedAt:'2026-10-23T12:00:00Z', fetchImpl:async (url) => {
    if (url.includes('down.')) return {ok:false,status:503};
    return {ok:true,json:async()=>({dataFeedElement:[{title:'Ops Lead',url:'/jobs/1'}]})};
  }});
  assert.equal(result.jobs.length, 1);
  assert.equal(result.jobs[0].company, 'Acme');
  assert.equal(result.diagnostics[0].status, 'ok');
  assert.equal(result.diagnostics[1].status, 'unavailable');
});

test('invalid sources are visible instead of treated as an empty board', async () => {
  const result = await scanPublicSources([{provider:'softgarden'}]);
  assert.equal(result.jobs.length, 0);
  assert.equal(result.diagnostics[0].status, 'invalid_source');
});
