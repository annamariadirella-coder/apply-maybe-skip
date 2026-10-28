// Pure diagnostics. This module never starts a scan or updates production state.
export function inspectPacket(packet, {scanStartedAt, expectedRunId=null, mode='requested_run', maxAgeMs=null, now=Date.now()}={}) {
 if(!['requested_run','scheduled_snapshot'].includes(mode))throw new Error('Unknown coordination mode');
 if(!packet||!Array.isArray(packet.candidates))throw new Error('Invalid collector packet');
 const checked=Date.parse(packet.checked_at||''),start=Date.parse(scanStartedAt||'');
 let status='SOURCE_UNAVAILABLE',reason='missing_or_invalid_timestamp';
 if(Number.isFinite(checked)&&Number.isFinite(start)&&checked<=now+60000&&start<=now+60000){
  if(mode==='requested_run'){
   if(!expectedRunId)reason='missing_run_correlation';
   else if(packet.run_id!==expectedRunId)reason='run_id_mismatch';
   else if(checked<start)reason='output_precedes_requested_run';
   else {status='READY';reason='correlated_output';}
  }else if(!Number.isFinite(maxAgeMs)||maxAgeMs<=0)reason='snapshot_age_policy_required';
  else if(checked>start+60000)reason='snapshot_postdates_scan_start';
  else if(start-checked>maxAgeMs)reason='snapshot_too_old';
  else {status='SNAPSHOT_AVAILABLE';reason='recent_snapshot_not_a_new_run';}
 }
 const coverage=packet.board_coverage||{},counts=coverage.current_run_counts||{};
 const metrics={configured:coverage.boards_configured??packet.total_company_boards??null,
 attempted:coverage.boards_attempted_this_run??packet.company_boards??null,
 completed:coverage.boards_completed_this_run??null,incomplete:coverage.boards_incomplete_this_run??null,
 unavailable:Array.isArray(coverage.unavailable_this_run)?coverage.unavailable_this_run.length:null,
 not_attempted:coverage.boards_not_attempted_this_run??null,paused:counts.paused??null};
 const issues=[];
 for(const [key,value] of Object.entries(metrics))if(value!==null&&(!Number.isInteger(value)||value<0))issues.push('invalid_count:'+key);
 if(['attempted','completed','incomplete','unavailable'].every(k=>Number.isInteger(metrics[k]))&&metrics.attempted!==metrics.completed+metrics.incomplete+metrics.unavailable)issues.push('attempt_partition_mismatch');
 if(['configured','attempted','not_attempted'].every(k=>Number.isInteger(metrics[k]))&&metrics.configured!==metrics.attempted+metrics.not_attempted)issues.push('configured_partition_mismatch');
 if(issues.length){status='SOURCE_UNAVAILABLE';reason='inconsistent_coverage';}
 return {status,reason,mode,checked_at:packet.checked_at||null,run_id:packet.run_id||null,
 collector_version:packet.collector_version||null,
 snapshot_metrics:metrics,current_scan_metrics:status==='READY'?metrics:null,
 candidate_records:packet.candidates.length,queued_discovery_records:Array.isArray(packet.discovery_leads)?packet.discovery_leads.length:null,
 fit_assessed:packet.fit_assessed===true,issues};
}
