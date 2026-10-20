const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const ctx=vm.createContext({console});
for(const f of ['ScoringConfig.gs','Scoring.gs','Code.gs'])vm.runInContext(fs.readFileSync('apps-script/'+f,'utf8'),ctx);
const run=s=>vm.runInContext(s,ctx);
run(`var entry={url:'https://docs.google.com/document/d/e/fictional/pub',company:'Fictional',title:'Head of Operations',location:'Berlin'};
var config={PUBLIC_RECRUITING_SOURCES:JSON.stringify([entry])};var sources=publicRecruitingSources(config);var calls=[];
var body='<html><script>SECRET_BOOTSTRAP</script><div id="contents"><p>'+('Build cross-functional business operations. '.repeat(12))+'</p><a href="https://jobs.ashbyhq.com/fictional-public/abc">Apply</a></div></html>';
var code=200;var UrlFetchApp={fetch:(url,options)=>{calls.push({url,options});return {getResponseCode:()=>code,getContentText:()=>body};}};
var feed=discoverPublicRecruiting(sources[0]);`);
assert.equal(run('calls.length'),1);
assert.equal(run('calls[0].options.followRedirects'),false);
assert.equal(run('Object.keys(calls[0].options).includes("headers")'),false);
assert.equal(run('feed.jobs[0].description.includes("SECRET_BOOTSTRAP")'),false);
assert.equal(run('feed.jobs[0].source_capture_method'),'public_fetch');
assert.equal(run('feed.jobs[0].employer_live_verified'),false);
assert.equal(run('feed.jobs[0].requires_employer_verification'),true);
assert.equal(run('feed.jobs[0].employer_references.length'),1);
for(const url of ['http://localhost/a','https://docs.google.com.evil.example/document/d/e/x/pub','https://docs.google.com/document/d/private/edit','https://user:pass@fictional.notion.site/jobs','https://fictional.notion.site.evil.example/jobs','https://127.0.0.1/jobs','https://fictional.notion.site/jobs?redirect=http://localhost']){
ctx.bad=url;assert.throws(()=>run('publicRecruitingUrl(bad)'));
}
for(const status of [302,401,403,404,429]){ctx.status=status;run('code=status;');assert.throws(()=>run('discoverPublicRecruiting(sources[0])'),/unavailable/);}
run(`code=200;body='<html><script>'+('bootstrap'.repeat(100))+'</script><p>Log in to Notion</p></html>';`);
assert.throws(()=>run('discoverPublicRecruiting(sources[0])'),/pasted/);
run(`var pasted=Object.assign({},entry,{url:'https://fictional.notion.site/operations-abc',text:'Build business operations. '.repeat(15)});var source=publicRecruitingSources({PUBLIC_RECRUITING_SOURCES:JSON.stringify([pasted])})[0];var before=calls.length;feed=discoverPublicRecruiting(source);`);
assert.equal(run('calls.length'),run('before'));
assert.equal(run('feed.jobs[0].source_capture_method'),'pasted_text');
assert.equal(run('feed.pages'),0);
assert.throws(()=>run('publicRecruitingSources({PUBLIC_RECRUITING_SOURCES:JSON.stringify(Array(6).fill(entry))})'),/five/);
assert.throws(()=>run('publicRecruitingSources({PUBLIC_RECRUITING_SOURCES:JSON.stringify([entry,entry])})'),/Duplicate/);
run(`body='x'.repeat(250001);`);assert.throws(()=>run('discoverPublicRecruiting(sources[0])'),/large/);
// Real market integration: normal dedup, retained queue, ATS learning and outage.
run(`body='<article>'+('Build business operations. '.repeat(15))+'<a href="https://jobs.ashbyhq.com/fictional-public/abc">Apply</a></article>';discoverFeed=()=>({jobs:[],pages:1,truncated:false});var state={};var result=marketDiscovery(new Set(),{},state,config);`);
assert.equal(run('result.leads.length'),1);
assert.equal(run('result.new_boards'),1);
assert.equal(run('result.catchup.unknown_date'),1);
run('result=marketDiscovery(new Set(),{},state,config);');
assert.equal(run('result.leads.length'),1);
assert.equal(run('result.new_boards'),0);
run('code=403;result=marketDiscovery(new Set(),{},state,config);');
assert.equal(run('result.leads.length'),1);
assert.equal(run('result.errors.length'),1);
run('marketDiscovery(new Set(identities(result.leads[0])),{},state,config);');
assert.equal(run('Object.keys(state.discovery_review).length'),0);
run('result=marketDiscovery(new Set(),{},{},{PUBLIC_RECRUITING_SOURCES:"broken"});');
assert.equal(run('result.errors[0].error_type'),'invalid_configuration');
assert.equal(run('result.stats.length'),4);
console.log('PASS public Docs/Notion recruiting sources: provenance, no redirects/credentials, script removal, fallback, dedup, learning, outage, tracker');
