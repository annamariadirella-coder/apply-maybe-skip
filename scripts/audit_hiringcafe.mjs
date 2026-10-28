// Offline, read-only audit. Raw exports and row-level results must stay private.
import fs from 'node:fs';
import vm from 'node:vm';
import {pathToFileURL} from 'node:url';
import {canonicalUrl} from '../core/jobs.js';

const context=vm.createContext({});
vm.runInContext(fs.readFileSync(new URL('../services/collector/Code.gs',import.meta.url),'utf8'),context);
const exclusionReason=vm.runInContext('exclusionReason',context);
const boardFromUrl=vm.runInContext('boardFromUrl',context);
const boardKey=vm.runInContext('boardKey',context);
const norm=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();
const roleKey=j=>norm(j.company)+'|'+norm(j.title);
const tally=items=>items.reduce((out,key)=>(out[key]=(out[key]||0)+1,out),{});
const aliases={grnhse:'greenhouse'};
const supported=new Set(['greenhouse','ashby','lever','personio','recruitee','smartrecruiters','workable','teamtailor']);

export function audit(report,details,groups) {
  if(!Array.isArray(report.candidates)||!Array.isArray(details.jobs)||!Array.isArray(groups.companies))throw new Error('Expected collector report, HiringCafe details and grouped export.');
  const refs=groups.companies.flatMap(c=>c.jobs||[]).map(j=>j.job_id);
  const refSet=new Set(refs),detailIds=new Set(details.jobs.map(j=>j.requisition_id));
  const candidates=report.candidates,leads=report.discovery_leads||[],all=[...candidates,...leads];
  const pages=new Map();(report.board_pages||[]).forEach(p=>pages.set(p.board,p));
  const inventory=report.board_coverage?.inventory||[];
  const rows=details.jobs.map(raw=>{
    const data=raw.v5_processed_job_data||{},job={company:data.company_name||raw.enriched_company_data?.name||'',title:raw.job_information?.title||raw.job_information?.job_title_raw||'',url:raw.apply_url||'',location:data.formatted_workplace_location||'',description:''};
    const url=canonicalUrl(job.url),exact=j=>url&&canonicalUrl(j.url)===url;
    const provider=aliases[raw.source]||raw.source;
    const board=boardFromUrl(job.url,job.company);
    const entry=board?inventory.find(b=>b.key===boardKey(board)):null;
    const event=entry?pages.get(entry.key):null;
    // Title-only matches are suggestions, never certified identity matches.
    const possible=all.some(j=>roleKey(j)===roleKey(job));
    const records=report.opportunity_diagnostics?.records||[];const explicit=['queue','discovery','listing'].map(stage=>records.find(r=>r.stage===stage&&canonicalUrl(r.url)===url&&url)).find(Boolean);
    const filter=exclusionReason(job);
    let classification;
    if(candidates.some(exact))classification='presented_candidate';
    else if(leads.some(exact))classification='discovery_lead_requires_verification';
    else if(explicit)classification='recorded:'+explicit.reason;
    else if(possible)classification='possible_identity_match_needs_confirmation';
    else if(raw.is_expired===true)classification='export_marked_expired_not_live_verified';
    else if(!supported.has(provider))classification='unsupported_provider';
    else if(!entry)classification='board_not_in_inventory_or_url_unrecognized';
    else if(event?.status==='unavailable')classification='board_unavailable_this_run';
    else if(event?.status==='page_checkpoint')classification='board_incomplete_this_run';
    else if(!event)classification=entry.enabled===false?'board_paused':'board_not_attempted_this_run';
    else classification='unexplained_absence_needs_queue_tracker_or_listing_evidence';
    return {reference_id:raw.requisition_id,company:job.company,title:job.title,url:job.url,provider,classification,board_key:entry?.key||null,filter_replay:filter||'passes_available_fields_only',filter_replay_is_historical_reason:false,full_description_available:false};
  });
  const statuses=tally([...pages.values()].map(p=>p.status));
  return {summary:{report_version:report.collector_version,checked_at:report.checked_at,candidates:candidates.length,discovery_leads:leads.length,deferred:report.deferred,configured_boards:report.total_company_boards,attempted_boards:pages.size,completed_boards:statuses.ok||0,incomplete_boards:statuses.page_checkpoint||0,unavailable_boards:statuses.unavailable||0,detail_rows:rows.length,unique_detail_ids:detailIds.size,group_rows:groups.companies.length,group_total_metadata:groups.total,group_page:groups.page,reference_rows:refs.length,unique_reference_ids:refSet.size,joined_detail_ids:[...detailIds].filter(id=>refSet.has(id)).length,references_without_details:[...refSet].filter(id=>!detailIds.has(id)).length,details_outside_reference_page:[...detailIds].filter(id=>!refSet.has(id)).length,classifications:tally(rows.map(r=>r.classification)),providers:tally(rows.map(r=>r.provider)),filter_replay:tally(rows.map(r=>r.filter_replay))},rows,limitations:['One grouped page is not the entire search result. Missing detail rows cannot be assessed.','No Tracker or processed state was accessed; queue/cap/tracker causes remain unknown without explicit evidence.','Current repository filters are a counterfactual replay, not proof of historical exclusion. Exports lack full JD text.','No employer liveness check or fit recommendation is implied.']};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  if(process.argv.length!==5)throw new Error('Usage: node scripts/audit_hiringcafe.mjs candidates.json details.json groups.json');
  const result=audit(...process.argv.slice(2).map(p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''))));
  // Only aggregate counts leave the CLI; row-level audit is available to local callers.
  console.log(JSON.stringify({summary:result.summary,limitations:result.limitations},null,2));
}
