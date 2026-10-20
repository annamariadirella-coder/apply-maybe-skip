const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const ctx=vm.createContext({console});
for(const f of ['ScoringConfig.gs','Scoring.gs','Code.gs'])vm.runInContext(fs.readFileSync('apps-script/'+f,'utf8'),ctx);
const run=s=>vm.runInContext(s,ctx);
run(`var calls=0,b={provider:'workable',board:'fictional',company:'Fictional',optional:true};
var raw={shortcode:'ABC',title:'Head of Operations',city:'Berlin',country:'DE',description:'Lead business operations. '.repeat(20)};
var payload={jobs:[raw]};
var UrlFetchApp={fetchAll:requests=>{calls+=requests.length;return requests.map(()=>({getResponseCode:()=>200,getContentText:()=>JSON.stringify(payload)}));}};
var state={pending_review:{}},stats=[];RUN_CACHE={};RUN_WORKABLE_REQUESTS=0;RUN_WORKABLE_UNTIL=0;
collectBoards([b],state,{},new Set(),[],stats);
var job=jobFrom(raw,b);RUN_WORKABLE_REQUESTS=2;
var result=validateBatch([job],RUN_CACHE);`);
assert.equal(run('calls'),1);
assert.equal(run('result.get(jobKey(job)).job.id'),'ABC');
assert.equal(run('RUN_WORKABLE_REQUESTS'),2);
// A complete empty current response establishes absence without another request.
run(`RUN_CACHE={};RUN_WORKABLE_REQUESTS=0;payload={jobs:[]};collectBoards([b],state,{},new Set(),[],[]);RUN_WORKABLE_REQUESTS=2;result=validateBatch([job],RUN_CACHE);`);
assert.equal(run('calls'),2);
assert.equal(run('result.get(jobKey(job)).job'),null);
// Another board cannot borrow this board's response or imply closure at quota.
run(`var other=Object.assign({},job,{board:Object.assign({},b,{board:'other'})});result=validateBatch([other],RUN_CACHE);`);
assert.equal(run('calls'),2);
assert.equal(run('result.get(jobKey(other)).error'),'ProviderQuota');
assert.equal(run("diagnostic('ProviderQuota').error_type"),'provider_quota');
assert.equal(run("diagnostic('ProviderQuota').retryable"),true);
assert.equal(run("diagnostic('ProviderCooldown').error_type"),'provider_cooldown');
// Malformed responses must not be cached as an empty complete listing.
run(`RUN_CACHE={};RUN_WORKABLE_REQUESTS=0;payload={broken:true};collectBoards([b],state,{},new Set(),[],[]);`);
assert.equal(run('RUN_CACHE[boardKey(b)]'),undefined);
console.log('PASS Workable same-run cache, empty response, board isolation, quota/cooldown distinction, malformed response');
