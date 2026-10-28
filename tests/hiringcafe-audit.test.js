import test from 'node:test';
import assert from 'node:assert/strict';
import {audit} from '../scripts/audit_hiringcafe.mjs';

const detail=(id,url,title='Head of Operations',source='ashby')=>({requisition_id:id,source,apply_url:url,job_information:{title},v5_processed_job_data:{company_name:'Fictional Acme',formatted_workplace_location:'Berlin'}});
test('grouped references join via requisition ID and never inflate detail counts',()=>{
  const result=audit({candidates:[],discovery_leads:[]},{jobs:[detail('a','https://jobs.ashbyhq.com/fictional/a')]},{total:900,page:0,companies:[{jobs:[{job_id:'a'},{job_id:'b'},{job_id:'b'}]}]});
  assert.equal(result.summary.detail_rows,1);assert.equal(result.summary.unique_reference_ids,2);assert.equal(result.summary.references_without_details,1);assert.equal(result.summary.joined_detail_ids,1);assert.equal(result.summary.group_total_metadata,900);
});
test('exact URLs, weak title matches, unsupported sources and historical uncertainty stay distinct',()=>{
  const jobs=[detail('a','https://jobs.ashbyhq.com/fictional/a'),detail('b','https://jobs.ashbyhq.com/fictional/b'),detail('c','https://fictional.example/c','Director of Strategy','workday'),detail('d','https://jobs.ashbyhq.com/fictional/d','Junior Operations')];
  const result=audit({candidates:[{company:'Fictional Acme',title:'Head of Operations',url:jobs[0].apply_url+'?utm_source=x'}],board_coverage:{inventory:[{key:'ashby:fictional:global',provider:'ashby',board:'fictional'}]},board_pages:[{board:'ashby:fictional:global',status:'ok'}]},{jobs},{companies:[]});
  assert.deepEqual(result.rows.map(r=>r.classification),['presented_candidate','possible_identity_match_needs_confirmation','unsupported_provider','unexplained_absence_needs_queue_tracker_or_listing_evidence']);
  assert.equal(result.rows[3].filter_replay,'junior_or_student');assert.equal(result.rows[3].filter_replay_is_historical_reason,false);
});
test('last board event wins over page checkpoints and historical health',()=>{
  const inventory=[{key:'ashby:fictional:global',status:'ok',last_success_at:'2020-01-01'}],details={jobs:[detail('a','https://jobs.ashbyhq.com/fictional/a')]};
  const result=audit({candidates:[],board_coverage:{inventory},board_pages:[{board:inventory[0].key,status:'page_checkpoint'},{board:inventory[0].key,status:'ok'}]},details,{companies:[]});
  assert.equal(result.summary.completed_boards,1);assert.equal(result.summary.incomplete_boards,0);
  assert.equal(audit({candidates:[],board_coverage:{inventory}},details,{companies:[]}).rows[0].classification,'board_not_attempted_this_run');
});
