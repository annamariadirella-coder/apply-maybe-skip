const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function fixture(){const ctx=vm.createContext({console});vm.runInContext(fs.readFileSync('apps-script/Code.gs','utf8'),ctx);return s=>vm.runInContext(s,ctx);}
test('coverage distinguishes current completion, checkpoints, failure, paused and unchecked sources',()=>{
  const run=fixture();const c=JSON.parse(run(`JSON.stringify(coverageSnapshot([
    {provider:'ashby',board:'fictional-a',company:'A'},
    {provider:'ashby',board:'fictional-b',company:'B'},
    {provider:'ashby',board:'fictional-c',company:'C'},
    {provider:'ashby',board:'fictional-d',company:'D'}
  ],{board_health:{'ashby:fictional-d:global':{status:'ok',last_success_at:'2020-01-01'}}},[
    {board:'ashby:fictional-a:global',status:'page_checkpoint'},
    {board:'ashby:fictional-a:global',status:'ok'},
    {board:'ashby:fictional-b:global',status:'page_checkpoint'},
    {board:'ashby:fictional-c:global',status:'unavailable',reason:'HTTP 429'}]))`));
  assert.equal(c.boards_attempted_this_run,3);assert.equal(c.boards_completed_this_run,1);assert.equal(c.boards_incomplete_this_run,1);assert.equal(c.completion_ratio,.25);assert.equal(c.inventory[3].current_run_status,'not_attempted');assert.equal(c.inventory[2].current_run_reason,'HTTP 429');assert.equal(c.boards_not_attempted_this_run,1);
  run(`BOARD_AUDIT['lever:fictional']={enabled:false};`);assert.equal(run(`boardAudit({provider:'lever',board:'fictional'}).enabled`),false);assert.equal(run(`boardAudit({provider:'lever',board:'fictional',region:'eu'}).enabled`),undefined);run(`BOARD_AUDIT['lever:fictional:eu']={enabled:true};`);assert.equal(run(`boardAudit({provider:'lever',board:'fictional',region:'eu'}).enabled`),true);
  const paused=run(`coverageSnapshot(BOARDS,{},[]).inventory.filter(b=>b.current_run_status==='paused').length`);assert.ok(paused>0);assert.equal(run(`coverageSnapshot(BOARDS,{},[],true).inventory.filter(b=>b.current_run_status==='paused').length`),0);
});
test('filter reasons preserve eligibility and do not claim unknown location is a mismatch',()=>{
  const run=fixture();run(`var j={title:'Head of Operations',location:'Berlin',description:''};`);
  assert.equal(run('exclusionReason(j)'),null);assert.equal(run('eligible(j)'),true);
  for(const [patch,reason] of [[{title:'Junior Operations'},'junior_or_student'],[{title:'Engineer'},'no_role_family'],[{location:''},'location_not_confirmed'],[{location:'Remote US only'},'location_restricted'],[{description:'Fluent German required'},'mandatory_german']])assert.equal(run(`exclusionReason(Object.assign({},j,${JSON.stringify(patch)}))`),reason);
});
test('private bounded diagnostics keep final stage disposition and separate evaluation counts',()=>{
  const run=fixture();run(`RUN_DIAGNOSTICS={evaluations:{},records:{},omitted_events:0};var j={provider:'ashby',id:'a',url:'https://fictional.example/a',description:'PRIVATE JD'};recordDisposition(j,'queue','awaiting_validation');recordDisposition(j,'queue','presented');for(var i=0;i<1002;i++)recordDisposition({provider:'ashby',id:String(i)},'listing','no_role_family');`);
  const d=JSON.parse(run('JSON.stringify(dispositionSnapshot())'));assert.equal(d.records.length,1001);assert.equal(d.records_truncated,true);assert.equal(d.omitted_events,2);assert.equal(d.retained_disposition_counts['queue:presented'],1);assert.equal(d.evaluation_counts.awaiting_validation,1);assert.ok(!JSON.stringify(d).includes('PRIVATE JD'));
});
test('board outages and incomplete lists are validation errors, never closed jobs',()=>{
  const run=fixture();run(`var b={provider:'ashby',board:'fictional',company:'Acme'},j={id:'a',provider:'ashby',board:b};var UrlFetchApp={fetchAll:urls=>urls.map(()=>({getResponseCode:()=>404}))};`);
  assert.equal(run(`validateBatch([j],{}).get(jobKey(j)).error`),'HTTP 404');
  run(`listingResponse=()=>({jobs:[],more:true});UrlFetchApp={fetchAll:urls=>urls.map(()=>({getResponseCode:()=>200}))};`);
  assert.equal(run(`validateBatch([j],{}).get(jobKey(j)).error`),'Incomplete listing');assert.equal(run(`diagnostic('Incomplete listing').error_type`),'incomplete_listing');
});
