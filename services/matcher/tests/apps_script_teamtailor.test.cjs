const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function fixture(){const c=vm.createContext({console});vm.runInContext(fs.readFileSync('apps-script/Code.gs','utf8'),c);const run=s=>vm.runInContext(s,c);run(`var b={provider:'teamtailor',board:'careers.fictional.example',company:'Fictional Acme',page_size:1};BOARDS.push(b);`);return {c,run};}
function posting(id=42,host='careers.fictional.example'){return {id:'feed-uuid-'+id,title:'Head of Operations',url:'https://'+host+'/jobs/'+id+'-head-of-operations',date_published:'2026-10-01',content_html:'<p>'+'Lead product operations and coordinate international teams. '.repeat(6)+'</p>',_jobposting:{'@type':'JobPosting',identifier:{value:id},title:'Head of Operations',description:'Full employer description.',jobLocation:[{address:{addressLocality:'Berlin',addressCountry:'DE'}}]}};}
function feed(items,next=null,host='careers.fictional.example'){return {version:'https://jsonfeed.org/version/1.1',feed_url:'https://'+host+'/jobs.json',items,next_url:next};}
function response(body,code=200){return {getResponseCode:()=>code,getContentText:()=>JSON.stringify(body)};}
function mock(c,fn){const requests=[];c.UrlFetchApp={fetchAll:items=>items.map(item=>{requests.push(item);return fn(item.url);}),fetch:(url,options)=>{requests.push({url,...options});return fn(url);}};return requests;}
test('employer feed retains exact identity, full text, location and host-scoped keys',()=>{
 const {c,run}=fixture();c.raw=posting();assert.equal(run('jobFrom(raw,b).id'),'42');assert.match(run('jobFrom(raw,b).location'),/Berlin, Germany/);assert.equal(run('jobFrom(raw,b).description_source'),'employer_feed');assert.equal(run('jobKey(jobFrom(raw,b))'),'teamtailor:careers.fictional.example:42');assert.equal(run('vacancyId(raw.url)'),run('jobKey(jobFrom(raw,b))'));assert.notEqual(run(`jobKey({provider:'teamtailor',board:{board:'other.fictional.example'},id:'42'})`),run('jobKey(jobFrom(raw,b))'));assert.equal(run('boardFromUrl(raw.url,"Untrusted name").company'),'Fictional Acme');
 assert.equal(run(`boardFromUrl('https://careers.fictional.example.evil.example/jobs/42-test','X')`),null);assert.equal(run(`boardFromUrl('https://unknown.example/jobs/42-test','X')`),null);
});
test('malformed identity, cross-origin links, expired dates and unknown locations fail conservatively',()=>{
 const {c,run}=fixture();for(const mutate of [j=>j._jobposting.identifier.value=43,j=>j.url='https://evil.example/jobs/42-test',j=>j._jobposting.title='Wrong role',j=>delete j.content_html,j=>j._jobposting.validThrough='invalid']){c.raw=posting();mutate(c.raw);assert.throws(()=>run('jobFrom(raw,b)'));}
 c.raw=posting();c.raw._jobposting.validThrough='2020-01-01';assert.equal(run('jobFrom(raw,b)'),null);c.raw=posting();delete c.raw._jobposting.jobLocation;assert.equal(run('jobFrom(raw,b).location'),'');assert.equal(run('exclusionReason(jobFrom(raw,b))'),'location_not_confirmed');
 c.raw=posting();c.raw._jobposting.jobLocation=[null,{address:{addressCountry:null}}];assert.equal(run('jobFrom(raw,b).location'),'');assert.equal(run('exclusionReason(jobFrom(raw,b))'),'location_not_confirmed');
 for(const board of ['127.0.0.1','localhost','jobs.local','jobs.internal','user@host.example','host.example:443']){c.bad=board;assert.throws(()=>run('boardUrl({provider:"teamtailor",board:bad})'));}
});
test('pagination permits only forward same-origin pages and the configured page size',()=>{
 const {c,run}=fixture();c.body=feed([posting()],'https://careers.fictional.example/jobs.json?page=2&per_page=1');c.res=response(c.body);assert.equal(run('listingResponse(res,b,0).more'),true);
 for(const url of ['https://evil.example/jobs.json?page=2&per_page=1','https://careers.fictional.example/jobs.json?page=1&per_page=1','https://careers.fictional.example/jobs.json?page=3&per_page=1','https://careers.fictional.example/jobs.json?page=2&page=2','https://careers.fictional.example/jobs.json?page=2&per_page=100','https://careers.fictional.example/jobs.json?page=2&filter=all','https://careers.fictional.example/jobs.json?page=2#x']){c.body.next_url=url;c.res=response(c.body);assert.throws(()=>run('listingResponse(res,b,0)'));}
 c.res=response(feed([],'https://careers.fictional.example/jobs.json?page=2&per_page=1'));assert.throws(()=>run('listingResponse(res,b,0)'));
});
test('second-page verification is cached and absence requires a terminal complete feed',()=>{
 const {c,run}=fixture();c.raw=posting(43);const requests=mock(c,url=>response(new URL(url).searchParams.get('page')==='1'?feed([posting(42)],'https://careers.fictional.example/jobs.json?page=2&per_page=1'):feed([posting(43)])));
 run('var cache={},j=jobFrom(raw,b);');assert.equal(run('validateBatch([j],cache).get(jobKey(j)).job.id'),'43');assert.equal(requests.length,2);assert.ok(requests.every(r=>r.followRedirects===false));assert.equal(run('validate(j,cache).id'),'43');assert.equal(requests.length,2);c.raw=posting(44);assert.equal(run('validateBatch([jobFrom(raw,b)],cache).get(jobKey(jobFrom(raw,b))).job'),null);
 c.raw=posting(43);c.raw.url='https://careers.fictional.example/jobs/43-different';assert.equal(run('validateBatch([jobFrom(raw,b)],cache).get(jobKey(jobFrom(raw,b))).error'),'Identity mismatch');
});
test('HTTP failures and redirects never mean a posting is closed',()=>{
 for(const code of [301,403,404,429,503]){const {c,run}=fixture();c.raw=posting();mock(c,()=>response({},code));assert.equal(run('validateBatch([jobFrom(raw,b)],{}).get(jobKey(jobFrom(raw,b))).error'),'HTTP '+code);}
});
test('validation has a three-page budget; missing roles remain uncertain',()=>{
 const {c,run}=fixture();c.raw=posting(99);const requests=mock(c,url=>{const page=Number(new URL(url).searchParams.get('page'));return response(feed([posting(page)],'https://careers.fictional.example/jobs.json?page='+(page+1)+'&per_page=1'));});
 run('var cache={};');assert.equal(run('validateBatch([jobFrom(raw,b)],cache).get(jobKey(jobFrom(raw,b))).error'),'Incomplete listing');assert.equal(requests.length,3);c.raw=posting(1);assert.equal(run('validateBatch([jobFrom(raw,b)],cache).get(jobKey(jobFrom(raw,b))).job.id'),'1');assert.equal(requests.length,3);
});
test('repeated postings across pages fail without claiming complete coverage',()=>{
 const {c,run}=fixture();c.raw=posting(99);mock(c,url=>{const page=Number(new URL(url).searchParams.get('page'));return response(feed([posting(42)],'https://careers.fictional.example/jobs.json?page='+(page+1)+'&per_page=1'));});assert.equal(run('validateBatch([jobFrom(raw,b)],{}).get(jobKey(jobFrom(raw,b))).error'),'Duplicate Teamtailor pagination');
});
test('board collection resumes from its existing checkpoint without changing legacy state',()=>{
 const {c,run}=fixture();mock(c,url=>{const page=Number(new URL(url).searchParams.get('page'));return response(page===1?feed([posting(42)],'https://careers.fictional.example/jobs.json?page=2&per_page=1'):feed([posting(43)]));});
 run('var state={version:1,processed:{legacy:"keep"},pending_review:{}},stats=[];collectBoards([b],state,{BOARD_PAGE_LIMIT:1},new Set(),[],stats);');assert.equal(run('state.board_progress[boardKey(b)].page'),1);assert.equal(run('stats[0].status'),'page_checkpoint');run('collectBoards([b],state,{BOARD_PAGE_LIMIT:1},new Set(),[],stats);');assert.equal(run('state.board_progress[boardKey(b)]'),undefined);assert.equal(run('stats[1].status'),'ok');assert.equal(run('Object.keys(state.pending_review).length'),2);assert.equal(run('state.processed.legacy'),'keep');
});
test('new catalog is unique, keeps the existing boards and recognizes European Greenhouse links',()=>{
 const {run}=fixture();assert.equal(run('SOURCE_EXPANSION.length'),13);assert.equal(run('new Set(BOARDS.map(boardKey)).size'),run('BOARDS.length'));assert.equal(run(`boardFromUrl('https://job-boards.eu.greenhouse.io/omiocorp/jobs/123?gh_jid=123','Omio').board`),'omiocorp');assert.equal(run(`boardFromUrl('https://job-boards.eu.greenhouse.io.evil.example/omiocorp/jobs/123','X')`),null);
});
test('full scan uses the employer feed, preserves v1 state and emits diagnostic coverage',()=>{
 const {c,run}=fixture();mock(c,()=>response(feed([posting()])));
 run(`BOARDS.splice(0,BOARDS.length,b);var config=Object.fromEntries(CONFIG_KEYS.map(k=>[k,'synthetic']));var LockService={getScriptLock:()=>({tryLock:()=>true,releaseLock:()=>released=true})},released=false;var PropertiesService={getScriptProperties:()=>({getProperties:()=>config})};checkSource=()=>['Synthetic evidence'];googleRequest=()=>({getContentText:()=>JSON.stringify({values:[['Company','Role','Source','Status']]})});var fixtureState={version:1,processed:{legacy:'keep'},pending_review:{}};readState=()=>fixtureState;var writes=[];writeOutput=(config,name,body)=>writes.push({name,body});marketDiscovery=()=>({leads:[],stats:[],errors:[],new_boards:0});scanJobs();var report=JSON.parse(writes.find(w=>w.name==='candidates.json').body);`);
 assert.equal(run('report.candidates.length'),1);assert.equal(run('report.candidates[0].employer_live_verified'),true);assert.equal(run('report.candidates[0].description_source'),'employer_feed');assert.equal(run('report.board_coverage.boards_completed_this_run'),1);assert.equal(run('fixtureState.processed.legacy'),'keep');assert.equal(run('fixtureState.version'),1);assert.equal(run('released'),true);assert.equal(run('report.ai_scoring.enabled'),false);
});

test('mixed Workable and Teamtailor batches preserve redirect rejection',()=>{const {c,run}=fixture();const requests=mock(c,()=>response({}));run("parallelFetch(['https://www.workable.com/api/accounts/fictional?details=true',listingUrl(b,0)]);");assert.equal(requests[0].followRedirects,true);assert.equal(requests[1].followRedirects,false);});
