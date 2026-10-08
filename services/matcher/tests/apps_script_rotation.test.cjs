const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const ctx=vm.createContext({console});for(const f of ['ScoringConfig.gs','Scoring.gs','Code.gs'])vm.runInContext(fs.readFileSync('apps-script/'+f,'utf8'),ctx);const run=s=>vm.runInContext(s,ctx);
assert(run('BOARDS.length')>300);
assert.equal(run("vacancyId('https://acme.jobs.personio.de/job/123?language=en')"),'personio:acme:123');
assert.equal(run("vacancyId('https://jobs.smartrecruiters.com/Acme/123-senior-ops')"),'smartrecruiters:123');
assert.equal(run("vacancyId('https://apply.workable.com/acme/j/ABC/apply/')"),'workable:ABC');
assert.equal(run("boardFromUrl('https://acme.recruitee.com.evil.example/o/job','Acme')"),null);
run(`var b={provider:'greenhouse',board:'acme',company:'Acme'};var sample={id:1,internal_job_id:1,title:'Head of Operations',absolute_url:'https://boards.greenhouse.io/acme/jobs/1',location:{name:'Berlin'},content:'A'.repeat(250)};var requests=[];var UrlFetchApp={fetchAll:urls=>{requests.push(urls.map(x=>x.url));return urls.map(x=>({getResponseCode:()=>200,getContentText:()=>JSON.stringify(x.url.endsWith('/1')?sample:{jobs:[sample],meta:{total:1}})}));}};`);
run(`var state={version:1,processed:{legacy:1},pending_review:{}};collectBoards([b],state,{},new Set(),[],[]);`);
assert.equal(run("requests[0][0].includes('content=true')"),false);assert.equal(run('Object.keys(state.pending_review).length'),1);
run(`var results=validateBatch(Object.values(state.pending_review),{});`);assert.equal(run("results.get('greenhouse:1').job.description.length"),250);
assert.equal(run('requests[1][0]'),'https://boards-api.greenhouse.io/v1/boards/acme/jobs/1');
run(`var pa={provider:'personio',board:'acme',company:'Acme'};var pb={provider:'personio',board:'other',company:'Other'};var r={id:'1',name:'Head of Operations',office:'Berlin',description:'A'.repeat(250)};`);
assert.notEqual(run('jobKey(jobFrom(r,pa))'),run('jobKey(jobFrom(r,pb))'));
run(`var sr={provider:'smartrecruiters',board:'Acme',company:'Acme'};var sraw={id:'123',active:false};`);
assert.equal(run('verifyDetail({provider:"smartrecruiters",id:"123",board:sr},{getContentText:()=>JSON.stringify(sraw)})'),null);
run(`var savedFetch=UrlFetchApp;UrlFetchApp={fetchAll:urls=>urls.map(()=>({getResponseCode:()=>404,getContentText:()=>''}))};var st={pending_review:{}};var errs=[];var stats=[];collectBoards([{provider:'personio',board:'missing',company:'Missing',optional:true}],st,{},new Set(),errs,stats);`);
assert.equal(run('errs.length'),0);assert.equal(run('stats[0].status'),'unavailable');
run('UrlFetchApp=savedFetch;');
// Pagination resumes per board; a large board cannot monopolise the whole run.
run(`var lever={provider:'lever',board:'big',company:'Big'};requests=[];UrlFetchApp={fetchAll:urls=>urls.map(x=>({getResponseCode:()=>200,getContentText:()=>JSON.stringify(Array.from({length:100},(_,i)=>({id:String(i),text:'Engineer',hostedUrl:'https://jobs.lever.co/big/'+i,categories:{location:'Berlin'},description:'A'.repeat(250)})))}))};var paged={pending_review:{}};collectBoards([lever],paged,{BOARD_PAGE_LIMIT:'2'},new Set(),[],[]);`);
assert.equal(run("paged.board_progress[boardKey(lever)].page"),2);
run(`RUN_CLOCK={start:Date.now()-1000,budget:1};`);assert.throws(()=>run('parallelFetch(["https://example.com"])'),/TimeBudget/);run('RUN_CLOCK=null;');
// End-to-end v1, cap, queue, read-only source boundaries and nonblocking failures.
run(`var writes=[],released=false;var LockService={getScriptLock:()=>({tryLock:()=>true,releaseLock:()=>released=true})};var PropertiesService={getScriptProperties:()=>({getProperties:()=>Object.fromEntries(CONFIG_KEYS.map(k=>[k,'test']))})};checkSource=()=>{};googleRequest=()=>({getContentText:()=>JSON.stringify({values:[['Company','Role','Source','Status']]})});var fixture={version:1,processed:{old:'keep'},board_rotation:7,pending_review:{}};for(var i=0;i<25;i++){var j=jobFrom(Object.assign({},sample,{id:i,absolute_url:'https://boards.greenhouse.io/acme/jobs/'+i,title:'Head of Operations '+i}),b);fixture.pending_review[jobKey(j)]=j;}readState=()=>fixture;writeOutput=(c,n,body)=>writes.push({name:n,body});collectBoards=()=>0;validateBatch=js=>new Map(js.map(j=>[jobKey(j),{job:j}]));marketDiscovery=()=>({leads:[],stats:[],errors:[],new_boards:0});scanJobs();`);
assert.equal(run("JSON.parse(writes.find(w=>w.name==='candidates.json').body).candidates.length"),20);assert.equal(run('Object.keys(fixture.pending_review).length'),25);assert.equal(run('fixture.version'),1);assert.equal(run('fixture.processed.old'),'keep');assert.equal(run('fixture.board_rotation'),7);assert(run('released'));
assert.deepEqual(JSON.parse(run('JSON.stringify(writes.map(w=>w.name))')),['processed_jobs.json','candidates.json','candidates.md']);
run(`writes=[];googleRequest=()=>({getContentText:()=>JSON.stringify({values:[['Company','Role','Source','Status'],['Acme','Head of Operations 0','','Applied']]})});scanJobs();`);assert.equal(run("fixture.pending_review['greenhouse:0']"),undefined);
// Soft-stop still saves state and releases lock.
run(`writes=[];collectBoards=()=>{RUN_CLOCK.start=Date.now()-999999;return 0;};scanJobs();`);assert.equal(run("JSON.parse(writes.find(w=>w.name==='candidates.json').body).time_budget_reached"),true);assert.equal(run('writes.length'),3);
console.log('PASS: filters unchanged, identities, lightweight GH, fetchAll, pagination checkpoint, cap/queue, v1 migration, tracker dedup, soft-stop, isolated optional failure.');
