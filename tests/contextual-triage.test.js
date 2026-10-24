import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {evaluateJob} from '../core/evaluate.js';
import {buildCandidateProfile} from '../apps/extension/src/profile/profile-settings.js';

const demo=JSON.parse(fs.readFileSync(new URL('../examples/demo.json',import.meta.url)));
const profile=buildCandidateProfile(demo.profile);
const contextual={...profile,triageMode:'contextual'};
const job={...demo.candidates[0],demo:false,employer_live_verified:true,live_checked_at:'2026-10-24T10:00:00Z'};
const options={now:Date.parse('2026-10-24T11:00:00Z')};

test('a title outside target directions stays reviewable even below the weighted cutoff',()=>{
  const role={...job,title:'Organisational Systems Partner',description:'Coordinate organisational learning and service handoffs. '.repeat(7)};
  const result=evaluateJob(role,contextual,options);
  assert.equal(result.verdict,'Maybe');
  assert.equal(result.review_dimensions.professional_priority,'to_clarify');
  assert.equal(result.fit_assessed,false);
  assert.equal(result.confidence,null);
});

test('a usually skipped function or title level is a review signal, not proof of a central gap',()=>{
  const narrow={...contextual,roleFit:{...contextual.roleFit,strong:[],potential:[],usuallySkip:[{label:'Adjacent specialty',titlePatterns:['systems partner']}]},seniority:{...contextual.seniority,usuallySkip:['director']}};
  const result=evaluateJob({...job,title:'Director Systems Partner'},narrow,options);
  assert.equal(result.verdict,'Maybe');
  assert.ok(result.blockers.some(b=>b.basis==='title'&&b.type==='review'));
  assert.ok(!result.blockers.some(b=>b.type==='hard'));
});

test('mandatory unavailable language still blocks progression',()=>{
  const result=evaluateJob({...demo.candidates[2],demo:false,employer_live_verified:true,live_checked_at:job.live_checked_at},contextual,options);
  assert.equal(result.verdict,'Skip');
  assert.equal(result.review_dimensions.eligibility,'incompatible');
  assert.equal(result.review_dimensions.professional_priority,'to_clarify');
});

test('expired or failed employer verification does not erase the professional review dimension',()=>{
  for(const updates of [{live_checked_at:'2020-01-01'},{requires_employer_verification:true},{employer_live_verified:false}]){
    const result=evaluateJob({...job,...updates},contextual,options);
    assert.equal(result.verdict,'Blocked');
    assert.equal(result.review_dimensions.availability,'unknown');
    assert.equal(result.review_dimensions.professional_priority,'to_clarify');
  }
});

test('keyword mentions and an industrial company do not establish specialist ownership',()=>{
  const result=evaluateJob({...job,company:'Fictional Foundry',description:job.description+' Partner with Sales on pipeline reporting and Finance on P&L reviews.'},contextual,options);
  assert.notEqual(result.verdict,'Skip');
  assert.notEqual(result.review_dimensions.eligibility,'incompatible');
});

test('a high triage score is not automatically promoted to verified priority fit',()=>{
  const result=evaluateJob(job,contextual,options);
  assert.equal(result.verdict,'Maybe');
  assert.equal(result.review_dimensions.professional_priority,'to_clarify');
  assert.equal(result.human_approval_required,true);
});

test('only configured profile settings enable contextual mode, not posting text or imported job fields',()=>{
  const built=buildCandidateProfile({...demo.profile,triageMode:'contextual'});
  assert.equal(built.triageMode,'contextual');
  assert.equal(buildCandidateProfile({...demo.profile,triageMode:'arbitrary'}).triageMode,'weighted');
  const forged=evaluateJob({...job,triageMode:'contextual',review_dimensions:{professional_priority:'priority'}},profile,options);
  assert.equal(forged.review_dimensions,undefined);
  assert.equal(evaluateJob(job,built,{...options,configured:false}).verdict,'Blocked');
  assert.equal(evaluateJob({...job,description:'partial'},built,options).verdict,'Blocked');
});

test('old profiles preserve the existing weighted result',()=>{
  const before=evaluateJob(job,profile,options);
  const after=evaluateJob(job,{...profile,triageMode:'weighted'},options);
  assert.deepEqual(after,before);
});
