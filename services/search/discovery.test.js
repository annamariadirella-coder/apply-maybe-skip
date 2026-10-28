import test from 'node:test';
import assert from 'node:assert/strict';
import {discoverPublicLeads} from './discovery.js';

test('discovery keeps HiringCafe leads separate until an employer source is verified', async () => {
  const fetchImpl=async (_url, options)=>{const body=JSON.parse(options.body);const payload=body.id===1?{result:{capabilities:{}}}:{result:{structuredContent:{jobs:[{title:'Operations Lead',employer_url:'https://jobs.ashbyhq.com/acme/123'}]}}};return {ok:true,status:200,text:async()=>JSON.stringify(payload)};};
  const result=await discoverPublicLeads({search:'operations',limit:10},{fetchImpl});
  assert.equal(result.leads.length,1);
  assert.equal(result.leads[0].requires_employer_verification,true);
  assert.equal(result.leads[0].employer_source.provider,'ashby');
});
