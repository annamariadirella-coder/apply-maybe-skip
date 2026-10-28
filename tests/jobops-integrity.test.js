import test from 'node:test';
import assert from 'node:assert/strict';
import {importTracker,mergeJobs,jobKey,normalizeJob} from '../core/jobs.js';
import {inspectPacket} from '../core/report-contract.js';
const role={company:'Example Labs',title:'Operations Lead',url:'https://job-boards.greenhouse.io/example/jobs/123',description:'Complete role description'};
test('bilingual applied and rejected statuses retain meaning and skip translated headers',()=>{
 const text='Company,Role title,Source,Status\nUnternehmen,Position,Quelle,Status\nExample Labs,Operations Lead,https://boards.greenhouse.io/example/jobs/123,Rejected / Abgelehnt\nExample Labs,Program Lead,https://boards.greenhouse.io/example/jobs/124,Applied / Beworben\nExample Labs,Service Lead,https://boards.greenhouse.io/example/jobs/125,Follow-up sent / Follow-up gesendet';
 const jobs=importTracker(text,mergeJobs([],[role]));assert.equal(jobs.length,3);assert.deepEqual(jobs.map(j=>j.status),['Rejected','Applied','Applied']);assert.equal(jobs[0].description,role.description);assert.equal(jobs[0].tracker_status_raw,'Rejected / Abgelehnt');
});
test('failed tracker import is atomic even after an earlier matching row',()=>{
 const existing=mergeJobs([],[role]);const before=structuredClone(existing);
 assert.throws(()=>importTracker('Company,Role title,Source,Status\nExample Labs,Operations Lead,'+role.url+',Applied\nExample Labs,New role,javascript:bad,Applied',existing));
 assert.deepEqual(existing,before);
 assert.throws(()=>importTracker('Company,Role title,Source,Status\nExample Labs,Operations Lead,'+role.url+',Unrecognised',existing));
 assert.deepEqual(existing,before);
});
test('ATS aliases merge exact vacancies while preserving status notes and existing workspace IDs',()=>{
 const existing=mergeJobs([],[role]);existing[0].status='Applied';existing[0].notes='Keep';const id=existing[0].id;
 const jobs=mergeJobs(existing,[{...role,url:'https://boards.greenhouse.io/example/jobs/123/apply?SRC=mail&utm_source=x'}]);
 assert.equal(jobs.length,1);assert.equal(jobs[0].id,id);assert.equal(jobs[0].status,'Applied');assert.equal(jobs[0].notes,'Keep');
});
test('same company and title do not collapse different exact vacancy IDs',()=>{
 assert.equal(mergeJobs([],[role,{...role,url:role.url.replace('123','124')}]).length,2);
 assert.notEqual(jobKey(role),jobKey({...role,url:'https://job-boards.greenhouse.io/another/jobs/123'}));
 assert.notEqual(jobKey(role),jobKey({...role,url:'https://job-boards.greenhouse.io.evil.example/example/jobs/123'}));
});
test('ambiguous tracker title-only matches require review',()=>{
 const jobs=mergeJobs([],[role,{...role,url:role.url.replace('123','124')}]);
 assert.throws(()=>importTracker('Company,Role title,Status\nExample Labs,Operations Lead,Applied',jobs),/Ambiguous/);
});
test('source attribution survives import without granting employer verification',()=>{
 const job=normalizeJob({...role,source:'Example discovery',employer_url:role.url});
 assert.equal(job.discovery_source,'Example discovery');assert.equal(job.employer_live_verified,false);
});
const start='2026-01-10T09:00:00Z',now=Date.parse('2026-01-10T09:10:00Z');
const packet={candidates:[],discovery_leads:[{}],checked_at:'2026-01-10T09:05:00Z',run_id:'test-run',
 board_coverage:{boards_configured:10,boards_attempted_this_run:4,boards_completed_this_run:2,boards_incomplete_this_run:1,unavailable_this_run:['example'],boards_not_attempted_this_run:6}};
test('requested output requires run correlation as well as timestamp',()=>{
 assert.equal(inspectPacket(packet,{scanStartedAt:start,now}).reason,'missing_run_correlation');
 assert.equal(inspectPacket(packet,{scanStartedAt:start,expectedRunId:'other',now}).reason,'run_id_mismatch');
 assert.equal(inspectPacket(packet,{scanStartedAt:start,expectedRunId:'test-run',now}).status,'READY');
});
test('old and future output do not pass requested-run gate',()=>{
 assert.equal(inspectPacket({...packet,checked_at:'2026-01-10T08:35:00Z'},{scanStartedAt:start,expectedRunId:'test-run',now}).status,'SOURCE_UNAVAILABLE');
 assert.equal(inspectPacket({...packet,checked_at:'2099-01-01'},{scanStartedAt:start,expectedRunId:'test-run',now}).status,'SOURCE_UNAVAILABLE');
});
test('scheduled snapshot needs explicit age policy and never becomes current scan coverage',()=>{
 const p={...packet,checked_at:'2026-01-10T08:35:00Z'};
 assert.equal(inspectPacket(p,{scanStartedAt:start,mode:'scheduled_snapshot',now}).status,'SOURCE_UNAVAILABLE');
 const result=inspectPacket(p,{scanStartedAt:start,mode:'scheduled_snapshot',maxAgeMs:3600000,now});
 assert.equal(result.status,'SNAPSHOT_AVAILABLE');assert.equal(result.current_scan_metrics,null);assert.equal(result.queued_discovery_records,1);
});
test('inconsistent counts fail closed without changing the packet',()=>{
 const p=structuredClone(packet);p.board_coverage.boards_completed_this_run=4;const before=structuredClone(p);
 assert.equal(inspectPacket(p,{scanStartedAt:start,expectedRunId:'test-run',now}).reason,'inconsistent_coverage');assert.deepEqual(p,before);
});

test('conflicting duplicate tracker states cannot silently overwrite history',()=>{
 const jobs=mergeJobs([],[role]),before=structuredClone(jobs);
 assert.throws(()=>importTracker('Company,Role title,Source,Status\nExample Labs,Operations Lead,'+role.url+',Rejected\nExample Labs,Operations Lead,'+role.url+',Applied',jobs),/Conflicting/);
 assert.deepEqual(jobs,before);
});
