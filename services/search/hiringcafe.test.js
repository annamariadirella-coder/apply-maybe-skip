import test from 'node:test';
import assert from 'node:assert/strict';
import {searchHiringCafe} from './hiringcafe.js';

test('HiringCafe discovery stays bounded and marks results for employer verification', async () => {
  const calls=[];
  const fetchImpl=async (_url, options)=>{calls.push(JSON.parse(options.body));return {ok:true,status:200,text:async()=>JSON.stringify(calls.length===1?{result:{capabilities:{}}}:{result:{structuredContent:{jobs:[{title:'Operations Lead'}]}}})};};
  const result=await searchHiringCafe({search:'product operations',location:'Germany',limit:25},{fetchImpl});
  assert.equal(calls.length,2);
  assert.equal(calls[1].params.arguments.limit,10);
  assert.equal(result.requires_employer_verification,true);
  assert.equal(result.results.jobs[0].title,'Operations Lead');
});

test('HiringCafe rate limits fail clearly for fallback handling', async () => {
  await assert.rejects(()=>searchHiringCafe({search:'operations'},{fetchImpl:async()=>({ok:false,status:429,text:async()=>''})}),/rate limit/);
});
