const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const logs=[],ctx=vm.createContext({console:{log:s=>logs.push(s)}});
for(const f of ['ScoringConfig.gs','Scoring.gs','Code.gs'])vm.runInContext(fs.readFileSync('apps-script/'+f,'utf8'),ctx);
const run=s=>vm.runInContext(s,ctx),json=s=>JSON.parse(run('JSON.stringify('+s+')'));
run(`var config={AI_SCORING_ENABLED:'true',OPENAI_API_KEY:'test-private-secret',OPENAI_MODEL:'synthetic',AI_MAX_JOBS:'1'};
var job={id:'1',provider:'greenhouse',url:'https://boards.greenhouse.io/fictional/jobs/1',company:'Fictional',title:'Head of Operations',location:'Berlin',description:'Own operations. English required. Annual base EUR 90000.',employer_live_verified:true,live_checked_at:new Date().toISOString()};
var evidence={ev_0:'Owned operations and improved efficiency.',ev_1:'✗ Did not own roadmap decisions.'};var charter=['Target senior operations. Minimum annual base EUR 80000.'];
var result={score:90,confidence:90,dimension_scores:{business_problem_fit:28,seniority_ownership:18,functional_fit:14,location_work_model:10,domain_fit:8,scope_compensation:12},business_problem:'Scale operations',rationale:'Direct operations evidence',scope:'Senior',cross_functional_scope:'Product',domain:'Technology',compensation_clues:'Annual base',checks:{location:{value:'compatible',jd_quote:'Berlin'},german:{value:'not_required',jd_quote:'English required.'},seniority:{value:'compatible',jd_quote:'Head of Operations'},compensation:{value:'unclear',jd_quote:'',charter_quote:''}},requirements:[{requirement:'Operations ownership',importance:'must_have',kind:'direct',jd_quote:'Own operations.',evidence_id:'ev_0',evidence_quote:'Owned operations',explanation:'Direct ownership'}],blockers:[],questions:[]};
var clone=x=>JSON.parse(JSON.stringify(x));var calls=[];var apiResult=result;
var UrlFetchApp={fetch:(url,options)=>{calls.push({url,options});return {getResponseCode:()=>200,getContentText:()=>JSON.stringify({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(apiResult)}]}]})};}};
var state={version:1,processed:{legacy:'keep'},pending_review:{'greenhouse:1':job}};
var sources={evidence:Object.values(evidence),charter};RUN_CLOCK={start:Date.now(),budget:270000};`);
assert.equal(run('aiSettings({}).status'),'disabled');
for(const patch of [{OPENAI_API_KEY:''},{OPENAI_MODEL:''},{AI_MAX_JOBS:'0'},{AI_APPLY_SCORE_MIN:'abc'},{AI_MAYBE_SCORE_MIN:'95'}]) {
  ctx.patch=patch;assert.equal(run('aiSettings(Object.assign({},config,patch)).status'),'misconfigured');
}
assert.equal(run('aiAssess(job,evidence,charter,config,aiSettings(config)).decision'),'APPLY');
assert.equal(json('calls[0]').url,'https://api.openai.com/v1/responses');
const body=JSON.parse(json('calls[0]').options.payload);
assert.equal(body.store,false);assert.equal(body.text.format.strict,true);assert(!body.input.includes('test-private-secret'));
run(`var altered=clone(result);altered.requirements[0].kind='transferable';`);
assert.equal(run('aiDecision(altered,AI_SCORING_POLICY)'),'MAYBE');
run(`altered.requirements[0].kind='unknown';altered.requirements[0].evidence_id='';altered.requirements[0].evidence_quote='';altered.questions=['Did you own enterprise accounts?'];`);
assert.equal(run('aiDecision(altered,AI_SCORING_POLICY)'),'BLOCKED');
run(`altered.checks.german={value:'required',jd_quote:'English required.'};`);
assert.equal(run('aiDecision(altered,AI_SCORING_POLICY)'),'SKIP');
run(`altered=clone(result);altered.checks.location.value='incompatible';`);assert.equal(run('aiDecision(altered,AI_SCORING_POLICY)'),'SKIP');
run(`altered=clone(result);altered.confidence=74;`);assert.equal(run('aiDecision(altered,AI_SCORING_POLICY)'),'MAYBE');
run(`altered.score=64;`);assert.equal(run('aiDecision(altered,AI_SCORING_POLICY)'),'SKIP');
run(`altered=clone(result);altered.blockers=[{category:'work_authorization',reason:'Confirm authorization'}];`);assert.equal(run('aiDecision(altered,AI_SCORING_POLICY)'),'BLOCKED');
run(`altered=clone(result);altered.score=99;`);assert.throws(()=>run('aiValidateAssessment(altered,job,evidence,charter)'),/InvalidAssessment/);
run(`altered=clone(result);altered.requirements[0].evidence_quote='Invented';`);assert.throws(()=>run('aiValidateAssessment(altered,job,evidence,charter)'),/InvalidCitation/);
run(`altered=clone(result);altered.requirements[0].evidence_id='ev_1';altered.requirements[0].evidence_quote='roadmap decisions';`);assert.throws(()=>run('aiValidateAssessment(altered,job,evidence,charter)'),/RestrictedEvidence/);
run(`altered=clone(result);altered.requirements[0].kind='gap';`);assert.throws(()=>run('aiValidateAssessment(altered,job,evidence,charter)'),/UnsupportedGap/);
run(`altered=clone(result);altered.questions=['a','b','c'];`);assert.throws(()=>run('aiValidateAssessment(altered,job,evidence,charter)'),/InvalidAssessment/);
run(`altered=clone(result);altered.checks.compensation={value:'incompatible',jd_quote:'Annual base EUR 90000.',charter_quote:'invented minimum'};`);assert.throws(()=>run('aiValidateAssessment(altered,job,evidence,charter)'),/InvalidCitation/);
assert.throws(()=>run(`aiAssess(Object.assign({},job,{employer_live_verified:false}),evidence,charter,config,aiSettings(config))`),/UnverifiedJob/);
assert.deepEqual(json(`aiSafeParagraphs(['Owned work','email@example.com','https://example.com','API key: secret'])`),['Owned work']);
run(`calls=[];job.scoring={decision:'APPLY'};var disabled=scoreCandidates([job],{},sources,state);`);assert.equal(run('calls.length'),0);assert.equal(run('job.scoring'),undefined);
run(`var second=Object.assign({},job,{id:'2',title:'Head of Operations 2',url:'https://boards.greenhouse.io/fictional/jobs/2'});state.pending_review['greenhouse:2']=second;var summary=scoreCandidates([job,second],config,sources,state);`);
assert.equal(run('summary.assessed'),1);assert.equal(run('summary.deferred'),1);
run(`calls=[];summary=scoreCandidates([job,second],config,sources,state);`);
assert.equal(JSON.parse(JSON.parse(json('calls[0]').options.payload).input).job.title,'Head of Operations 2');
assert.equal(run('second.scoring.decision'),'APPLY');assert.equal(run('job.scoring'),undefined);
run(`calls=[];UrlFetchApp.fetch=()=>{calls.push(1);throw new Error('test-private-secret private source text');};summary=scoreCandidates([job,second],config,sources,state);`);
assert.equal(run('summary.failed'),1);assert.equal(run('calls.length'),1);assert(!JSON.stringify(json('summary')).includes('test-private-secret'));assert.equal(logs.length,0);
run(`calls=[];RUN_CLOCK={start:Date.now()-240000,budget:270000};summary=scoreCandidates([job],config,sources,state);`);assert.equal(run('calls.length'),0);assert.equal(run('summary.deferred'),1);
// Real scan integration: lock, Tracker, authoritative verification, output/state and safe fallback.
run(`RUN_CLOCK=null;var writes=[],released=false;var LockService={getScriptLock:()=>({tryLock:()=>true,releaseLock:()=>released=true})};
var PropertiesService={getScriptProperties:()=>({getProperties:()=>Object.assign(Object.fromEntries(CONFIG_KEYS.map(k=>[k,'fixture'])),config)})};
checkSource=id=>id==='fixture'?sources.evidence:sources.charter;
googleRequest=()=>({getContentText:()=>JSON.stringify({values:[['Company','Role','Source','Status']]})});
readState=()=>state;collectBoards=()=>{};validateBatch=js=>new Map(js.map(j=>[jobKey(j),{job:Object.assign({},j)}]));
marketDiscovery=()=>({leads:[{title:'unverified lead',company:'Other',source:'Aggregator',location:'Remote',url:'https://example.com',description:'Untrusted'}],stats:[],errors:[],new_boards:0});
writeOutput=(c,n,body)=>writes.push({name:n,body});scanJobs();`);
assert.equal(run('writes.length'),3);assert(run('released'));assert.equal(run("JSON.parse(writes[1].body).ai_scoring.failed"),1);
assert.equal(run("JSON.parse(writes[1].body).fit_assessed"),false);assert.equal(run('state.processed.legacy'),'keep');assert.equal(run('Object.keys(state.pending_review).length'),2);
assert(!logs.join('\n').includes('test-private-secret'));
run(`writes=[];calls=[];googleRequest=()=>({getContentText:()=>JSON.stringify({values:[['Unknown']]})});`);
assert.throws(()=>run('scanJobs()'),/headers/);assert.equal(run('calls.length'),0);assert.equal(run('writes.length'),0);
// Completed scan includes provisional evidence scores and leaves all roles pending.
run(`writes=[];googleRequest=()=>({getContentText:()=>JSON.stringify({values:[['Company','Role','Source','Status']]})});
UrlFetchApp.fetch=(url,options)=>{calls.push({url,options});return {getResponseCode:()=>200,getContentText:()=>JSON.stringify({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(result)}]}]})};};scanJobs();`);
assert.equal(run("JSON.parse(writes[1].body).mode"),'collect_and_score');
assert.equal(run("JSON.parse(writes[1].body).ai_scoring.assessed"),1);
assert.equal(run("JSON.parse(writes[1].body).decision_counts.APPLY"),1);
assert.equal(run("JSON.parse(writes[1].body).discovery_leads[0].scoring"),undefined);
assert.equal(run('Object.keys(state.pending_review).length'),2);
// Disabled next run removes prior scores without losing the queue.
run(`writes=[];calls=[];PropertiesService.getScriptProperties=()=>({getProperties:()=>Object.fromEntries(CONFIG_KEYS.map(k=>[k,'fixture']))});scanJobs();`);
assert.equal(run('calls.length'),0);assert.equal(run("JSON.parse(writes[1].body).ai_scoring.status"),'disabled');
assert.equal(run("JSON.parse(writes[1].body).candidates.some(j=>j.scoring)"),false);
// Transport, refusal, incomplete JSON, schema and quote failures are all collector-only.
for(const response of [
  {code:429,body:{error:{message:'test-private-secret'}}},
  {code:200,body:{status:'incomplete',output:[]}},
  {code:200,body:{status:'completed',output:[{content:[{type:'refusal',refusal:'private source text'}]}]}},
  {code:200,body:{status:'completed',output:[{content:[{type:'output_text',text:'invalid json'}]}]}},
  {code:200,body:{status:'completed',output:[{content:[{type:'output_text',text:'{}'}]}]}}
]) {
  ctx.responseFixture=response;
  run(`RUN_CLOCK={start:Date.now(),budget:270000};UrlFetchApp.fetch=()=>({getResponseCode:()=>responseFixture.code,getContentText:()=>JSON.stringify(responseFixture.body)});summary=scoreCandidates([job],config,sources,state);`);
  assert.equal(run('summary.failed'),1);assert.equal(run('job.scoring'),undefined);
}
// Source parsing keeps DOCX body/table paragraphs separate, including qualifiers.
run(`var originalCheckSource=checkSource;`);
vm.runInContext(fs.readFileSync('apps-script/Code.gs','utf8').match(/function checkSource\(id\) \{[\s\S]*?\n\}/)[0],ctx);
run(`meta=()=>({mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',trashed:false});
googleRequest=()=>({getBlob:()=>({setContentType:()=>({})})});
var ns={getURI:()=> 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'};
var node=(name,text,children=[])=>({getName:()=>name,getNamespace:()=>ns,getText:()=>text,getChildren:()=>children});
var paragraph=t=>node('p','',[node('r','',[node('t',t)])]);
var xmlRoot=node('document','',[node('body','',[paragraph('Owned operations. '+ 'A'.repeat(110)),node('tbl','',[node('tr','',[node('tc','',[paragraph('✗ Did not own roadmap decisions.')])])])])]);
var XmlService={getNamespace:()=>ns,parse:()=>({getRootElement:()=>xmlRoot})};
var Utilities={unzip:()=>[{getName:()=> 'word/document.xml',getDataAsString:()=>'<document/>'}]};`);
assert.equal(json("checkSource('fixture')").length,2);
assert.equal(json("checkSource('fixture')")[1],'✗ Did not own roadmap decisions.');
console.log('PASS: opt-in AI, schema/citations, verdict guards, fairness, safe failure/budget fallback, Tracker-before-AI, no secret logs.');
