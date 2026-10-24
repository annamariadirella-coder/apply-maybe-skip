const fs=require('fs'),vm=require('vm'),test=require('node:test'),assert=require('node:assert/strict');
const c=vm.createContext({console:{log(){}}});
for(const f of ['ScoringConfig.gs','Scoring.gs','Code.gs'])vm.runInContext(fs.readFileSync('apps-script/'+f,'utf8'),c);
const run=s=>vm.runInContext(s,c),json=s=>JSON.parse(run('JSON.stringify('+s+')'));
run(`var policy=Object.assign({},AI_SCORING_POLICY,{targeting_mode:'contextual'});
var job={id:'1',provider:'greenhouse',company:'Fictional',title:'Systems Partner',location:'Berlin',url:'https://example.org/1',description:'Lead workflow planning. English required.',employer_live_verified:true,live_checked_at:new Date().toISOString()};
var evidence={ev_0:'Led planning for a fictional service team.',ev_gap:'✗ Did not own specialist forecasting.'};
var result={score:20,confidence:20,dimension_scores:{business_problem_fit:20,seniority_ownership:0,functional_fit:0,location_work_model:0,domain_fit:0,scope_compensation:0},business_problem:'Improve workflows',rationale:'Comparable planning',scope:'Senior',cross_functional_scope:'Service and Product',domain:'Fictional',compensation_clues:'Published',checks:{location:{value:'compatible',jd_quote:'Berlin'},german:{value:'not_required',jd_quote:'English required.'},seniority:{value:'compatible',jd_quote:'Systems Partner'},compensation:{value:'compatible',jd_quote:'Lead workflow planning.',charter_quote:''}},requirements:[{requirement:'Workflow planning',importance:'must_have',kind:'transferable',central:true,bridge_status:'credible',jd_quote:'Lead workflow planning.',evidence_id:'ev_0',evidence_quote:'Led planning',explanation:'Comparable service workflow and coordination outcomes'}],blockers:[],questions:[],mandate_review:{conclusion:'priority',rationale:'Cited experience supports comparable principal work despite a different function title.'}};
var clone=x=>JSON.parse(JSON.stringify(x));`);

test('contextual schema and cited transferable bridge allow priority without numerical cutoffs',()=>{
  assert.doesNotThrow(()=>run('aiValidateAssessment(result,job,evidence,[],policy)'));
  assert.equal(run('aiDecision(result,policy)'),'APPLY');
  assert.equal(run('contextualDimensions(result).professional_priority'),'priority');
});
test('supporting gaps and unknown eligibility preserve distinct professional judgement',()=>{
  run(`var r=clone(result);r.checks.location.value='unclear';`);
  assert.equal(run('aiDecision(r,policy)'),'MAYBE');
  assert.equal(run('contextualDimensions(r).professional_priority'),'priority');
  assert.equal(run('contextualDimensions(r).eligibility'),'unknown');
});
test('unknown central work and unproven bridges stay visible but cannot claim priority',()=>{
  run(`r=clone(result);r.requirements[0].bridge_status='unclear';`);
  assert.throws(()=>run('aiValidateAssessment(r,job,evidence,[],policy)'),/UnresolvedCentral/);
  run(`r.mandate_review.conclusion='unknown';`);
  assert.equal(run('aiDecision(r,policy)'),'MAYBE');
  assert.equal(run('contextualDimensions(r).professional_priority'),'to_clarify');
});
test('unsuitable requires a central essential gap; citations cannot be invented',()=>{
  run(`r=clone(result);r.mandate_review.conclusion='unsuitable';`);
  assert.throws(()=>run('aiValidateAssessment(r,job,evidence,[],policy)'),/UnsupportedCentralGap/);
  run(`r=clone(result);r.requirements[0].evidence_quote='Invented';`);
  assert.throws(()=>run('aiValidateAssessment(r,job,evidence,[],policy)'),/InvalidCitation/);
});
test('human-controlled actions and mandatory language conflicts retain their guards',()=>{
  run(`r=clone(result);r.blockers=[{category:'account_or_login',reason:'Candidate controls login'}];`);
  assert.equal(run('aiDecision(r,policy)'),'BLOCKED');
  run(`r=clone(result);r.checks.german.value='required';`);
  assert.equal(run('aiDecision(r,policy)'),'SKIP');
});
test('broad discovery does not exclude incidental title keywords or unknown locations',()=>{
  for(const title of ['Warehouse Systems Partner','Director Revenue Operations','Junior Strategy Partner','Organisational Systems Partner']){
    c.sample={title,location:'Remote',description:'Partner with Sales on pipeline and Finance on P&L.'};
    assert.equal(run("exclusionReason(sample,'contextual')"),null);
  }
  assert.equal(run("exclusionReason({...sample,location:'Remote US only'},'contextual')"),'location_restricted');
  assert.equal(run("exclusionReason({...sample,title:'Warehouse Systems Partner'},'weighted')"),'excluded_role_family');
});
test('contextual configuration never silently enables paid scoring',()=>{
  assert.equal(run("aiSettings({TARGETING_MODE:'contextual'}).enabled"),false);
  assert.equal(run("aiSettings({TARGETING_MODE:'invalid',AI_SCORING_ENABLED:'true'}).status"),'misconfigured');
});
test('broader queues retain adjacent roles while using family signals only as an ordering tie-break',()=>{
  run(`var queue={a:{title:'Systems Partner',location:'Remote',description:'Coordinate teams'},z:{title:'Head of Product Operations',location:'Berlin',description:'Lead workflows'}};`);
  const keys=json("pendingReviewOrder(queue,'contextual')");
  assert.equal(keys.length,2);
  assert.equal(keys[0],'z');
  run("queue.z.live_checked_at='2026-10-24T10:00:00Z'");
  assert.equal(json("pendingReviewOrder(queue,'contextual')")[0],'a');
});
test('a contextual collection run uses the new mode and resets it after finishing',()=>{
  run(`var outputs={},released=false,observed;
var LockService={getScriptLock:()=>({tryLock:()=>true,releaseLock:()=>released=true})};
var PropertiesService={getScriptProperties:()=>({getProperties:()=>Object.assign(Object.fromEntries(CONFIG_KEYS.map(k=>[k,'synthetic'])),{TARGETING_MODE:'contextual',BOARD_BATCH_SIZE:'1'})})};
checkSource=()=>['Fictional planning evidence'];googleRequest=()=>({getContentText:()=>JSON.stringify({values:[['Company','Role','Source','Status']]})});
readState=()=>({version:1,processed:{},pending_review:{},discovered_boards:[]});
collectBoards=()=>{observed=exclusionReason({title:'Warehouse Systems Partner',location:'Remote',description:'Coordinate workflows'});};
marketDiscovery=()=>({leads:[],stats:[],errors:[],new_boards:0});writeOutput=(config,name,body)=>outputs[name]=body;
scanJobs();`);
  assert.equal(run('observed'),null);
  assert.equal(json("JSON.parse(outputs['candidates.json'])").targeting_mode,'contextual');
  assert.equal(run('RUN_TARGETING_MODE'),'weighted');
  assert.equal(run('released'),true);
});
