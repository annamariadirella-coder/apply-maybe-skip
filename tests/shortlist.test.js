import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildShortlist,semanticScore,semanticQuery,semanticDocument} from '../core/shortlist.js';
import {buildCandidateProfile} from '../apps/extension/src/profile/profile-settings.js';
import {importPacket,mergeJobs} from '../core/jobs.js';
const demo=JSON.parse(fs.readFileSync(new URL('../examples/demo.json',import.meta.url)));
const settings=demo.profile,profile=buildCandidateProfile(settings),now=Date.now();
const real=i=>({...demo.candidates[i],demo:false,employer_live_verified:true,live_checked_at:new Date(now).toISOString(),status:'To review'});
const annotated=(job,score)=>({...job,semantic:{query:semanticQuery(settings),document:semanticDocument(job),score,model_version:'fictional-test'}});

test('up to three strong and two wildcards, with explicit gaps and empty slots',()=>{
 const list=buildShortlist([real(0),real(1),real(2)],profile,settings,{now});
 assert.equal(list.strong.length,1);assert.equal(list.wildcards.length,1);
 assert.ok(list.wildcards[0].gaps.length);assert.equal(list.fit_assessed,false);
 assert.deepEqual(list.unfilled,{strong:2,wildcards:1});
});
test('semantic maximum cannot bypass language, missing JD, stale check or profile gates',()=>{
 const unsafe=[real(2),{...real(0),description:'short'},{...real(0),live_checked_at:'2000-01-01'},{...real(0),requires_employer_verification:true}].map(j=>annotated(j,1));
 assert.equal(buildShortlist(unsafe,profile,settings,{now}).strong.length,0);
 assert.equal(buildShortlist([real(0)],profile,{...settings,configured:false},{now}).strong.length,0);
});
test('quota caps and canonical identities prevent duplicate shortlist slots',()=>{
 const strong=Array.from({length:6},(_,i)=>({...real(0),url:`https://example.org/strong/${i}`}));
 const wild=Array.from({length:4},(_,i)=>({...real(1),url:`https://example.org/wild/${i}`}));
 const list=buildShortlist([...strong,...wild,{...strong[0],url:strong[0].url+'?utm_source=duplicate'}],profile,settings,{now});
 assert.equal(list.strong.length,3);assert.equal(list.wildcards.length,2);
 assert.equal(new Set([...list.strong,...list.wildcards].map(x=>x.job.url.split('?')[0])).size,5);
 assert.equal(buildShortlist([{...real(0),status:'Applied'}],profile,settings,{now}).strong.length,0);
});
test('semantic import survives normalization and sorts only matching current snapshots',()=>{
 const a=annotated({...real(0),url:'https://example.org/a'},0.1),b=annotated({...real(0),url:'https://example.org/b'},0.9);
 const jobs=mergeJobs([],importPacket({candidates:[a,b]}).jobs);
 assert.equal(buildShortlist(jobs,profile,settings,{now}).strong[0].job.url,'https://example.org/b');
 assert.equal(semanticScore({...a,description:a.description+' changed'},settings),null);
 assert.equal(semanticScore(a,{...settings,strengths:['Changed profile']}),null);
 for(const score of [NaN,Infinity,2,'1'])assert.equal(semanticScore(annotated(a,score),settings),null);
});
test('conflicting duplicate state cannot promote an unverified or applied vacancy',()=>{
 assert.equal(buildShortlist([real(0),{...real(0),live_checked_at:'2000-01-01'}],profile,settings,{now}).strong.length,0);
 assert.equal(buildShortlist([real(0),{...real(0),status:'Applied'}],profile,settings,{now}).strong.length,0);
 assert.equal(buildShortlist([{...real(0),url:''}],profile,settings,{now}).strong.length,0);
});
