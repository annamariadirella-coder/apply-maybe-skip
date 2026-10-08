/** Optional assessment inside the existing scan lock. Never submits or writes sources. */
function aiSettings(config) {
  if(config.AI_SCORING_ENABLED!=='true') return {enabled:false,status:'disabled'};
  const policy=Object.assign({},AI_SCORING_POLICY);
  for(const [property,key] of [['AI_APPLY_SCORE_MIN','apply_score_min'],['AI_MAYBE_SCORE_MIN','maybe_score_min'],['AI_APPLY_CONFIDENCE_MIN','apply_confidence_min']]) {
    if(config[property]!==undefined) {
      const n=Number(config[property]);
      if(!String(config[property]).trim() || !Number.isInteger(n) || n<0 || n>100) return {enabled:false,status:'misconfigured'};
      policy[key]=n;
    }
  }
  const maxJobs=config.AI_MAX_JOBS===undefined?3:Number(config.AI_MAX_JOBS);
  if(!config.OPENAI_API_KEY || !config.OPENAI_API_KEY.trim() || !config.OPENAI_MODEL || !config.OPENAI_MODEL.trim()
     || !Number.isInteger(maxJobs) || maxJobs<1 || maxJobs>20 || policy.maybe_score_min>policy.apply_score_min) return {enabled:false,status:'misconfigured'};
  return {enabled:true,status:'ready',policy:policy,maxJobs:maxJobs};
}
function aiSafeParagraphs(paragraphs) {
  return paragraphs.map(p=>String(p).trim()).filter(p=>p && !/\S+@\S+|api[_ -]?key|private[_ -]?key|https?:\/\//i.test(p));
}
function aiEvidence(paragraphs) {
  const chunks={};aiSafeParagraphs(paragraphs).forEach((p,i)=>chunks['ev_'+i]=p);
  if(!Object.keys(chunks).length) throw new Error('InvalidEvidence');
  return chunks;
}
// Validate locally as well as remotely: refusals and malformed results never become recommendations.
function aiValidateSchema(value,schema) {
  if(schema.type==='object') {
    if(!value || typeof value!=='object' || Array.isArray(value)) throw new Error('InvalidAssessment');
    if(Object.keys(value).some(k=>!Object.prototype.hasOwnProperty.call(schema.properties,k)) || schema.required.some(k=>!Object.prototype.hasOwnProperty.call(value,k))) throw new Error('InvalidAssessment');
    Object.keys(schema.properties).forEach(k=>aiValidateSchema(value[k],schema.properties[k]));
  } else if(schema.type==='array') {
    if(!Array.isArray(value) || (schema.maxItems!==undefined && value.length>schema.maxItems)) throw new Error('InvalidAssessment');
    value.forEach(v=>aiValidateSchema(v,schema.items));
  } else if(schema.type==='integer') {
    if(!Number.isInteger(value) || value<schema.minimum || value>schema.maximum) throw new Error('InvalidAssessment');
  } else if(typeof value!==schema.type || (schema.enum && !schema.enum.includes(value))) throw new Error('InvalidAssessment');
}
function aiValidateAssessment(result,job,evidence,charter) {
  aiValidateSchema(result,AI_SCORING_SCHEMA);
  const jd=[job.title,job.location,job.description].join('\n');
  const cited=q=>!!q && jd.includes(q);
  if(!result.requirements.length || Object.values(result.dimension_scores).reduce((a,b)=>a+b,0)!==result.score) throw new Error('InvalidAssessment');
  result.requirements.forEach(r=>{
    if(!cited(r.jd_quote)) throw new Error('InvalidCitation');
    if(r.kind==='unknown') {if(r.evidence_id || r.evidence_quote) throw new Error('InvalidCitation');}
    else {
      const source=evidence[r.evidence_id];
      if(!source || !r.evidence_quote || !source.includes(r.evidence_quote)) throw new Error('InvalidCitation');
      if(['direct','transferable'].includes(r.kind) && /^\s*(?:[?✗]|needs confirmation|do not claim)/i.test(source)) throw new Error('RestrictedEvidence');
      if(r.kind==='gap' && !/✗|do not claim|no direct experience|has not used|not formal|did not own/i.test(source)) throw new Error('UnsupportedGap');
    }
  });
  Object.values(result.checks).forEach(c=>{if(c.value!=='unclear' && !cited(c.jd_quote)) throw new Error('InvalidCitation');});
  const pay=result.checks.compensation;
  if(pay.value==='incompatible' && (!pay.charter_quote || !charter.some(p=>p.includes(pay.charter_quote)))) throw new Error('InvalidCitation');
  if(result.requirements.some(r=>r.kind==='unknown' && r.importance==='must_have') && !result.questions.length) throw new Error('MissingQuestion');
  if(result.questions.some(q=>!q.trim()) || result.blockers.some(b=>!b.reason.trim())) throw new Error('InvalidAssessment');
}
// Same precedence as src.core.decide + src.scoring.assess on main.
function aiDecision(result,policy) {
  const checks=result.checks,must=result.requirements.filter(r=>r.importance==='must_have');
  if(checks.german.value==='required' && !policy.mandatory_professional_german_allowed) return 'SKIP';
  if(['location','seniority','compensation'].some(k=>checks[k].value==='incompatible') || must.some(r=>r.kind==='gap')) return 'SKIP';
  if(must.some(r=>r.kind==='unknown') || result.blockers.length) return 'BLOCKED';
  const maybe=must.some(r=>r.kind==='transferable') || ['location','seniority'].some(k=>checks[k].value==='unclear') || result.score<policy.apply_score_min || result.confidence<policy.apply_confidence_min;
  return maybe?(result.score<policy.maybe_score_min?'SKIP':'MAYBE'):'APPLY';
}
function aiAssess(job,evidence,charter,config,settings) {
  if(job.employer_live_verified!==true || !job.live_checked_at || job.requires_employer_verification===true) throw new Error('UnverifiedJob');
  // One bounded attempt, no retry/backoff. No Google bearer token goes to OpenAI.
  const response=UrlFetchApp.fetch('https://api.openai.com/v1/responses',{
    method:'post',contentType:'application/json',muteHttpExceptions:true,
    headers:{Authorization:'Bearer '+config.OPENAI_API_KEY},
    payload:JSON.stringify({model:config.OPENAI_MODEL,store:false,instructions:AI_SCORING_PROMPT,
      input:JSON.stringify({job:{company:job.company,title:job.title,location:job.location,description:job.description},evidence:evidence,charter:charter,policy:settings.policy}),
      max_output_tokens:7000,text:{format:{type:'json_schema',name:'fit_assessment',strict:true,schema:AI_SCORING_SCHEMA}}})
  });
  if(response.getResponseCode()!==200) throw new Error('AIRequestFailed');
  const body=JSON.parse(response.getContentText());
  if(body.status!=='completed' || !Array.isArray(body.output)) throw new Error('IncompleteAssessment');
  const blocks=body.output.flatMap(i=>i.content || []);
  if(blocks.some(b=>b.type==='refusal')) throw new Error('RefusedAssessment');
  const result=JSON.parse(blocks.filter(b=>b.type==='output_text').map(b=>b.text).join(''));
  aiValidateAssessment(result,job,evidence,charter);
  result.decision=aiDecision(result,settings.policy);
  result.mode='evidence';result.fit_assessed=true;result.human_approval_required=true;
  result.strongest_evidence=result.requirements.filter(r=>r.kind==='direct').slice(0,3);
  result.transferable_evidence=result.requirements.filter(r=>r.kind==='transferable');
  result.gaps=result.requirements.filter(r=>r.kind==='gap');
  result.assessed_at=new Date().toISOString();
  return result;
}
function scoreCandidates(candidates,config,sources,state) {
  const settings=aiSettings(config),summary={status:settings.status,attempted:0,assessed:0,failed:0,deferred:0};
  // Never reuse old evidence scores after a fresh live check or a disabled run.
  candidates.forEach(j=>{delete j.scoring;});
  if(!settings.enabled) return summary;
  const progress=state.ai_scoring_progress || {};
  state.ai_scoring_progress=Object.fromEntries(Object.entries(progress).filter(([key])=>state.pending_review[key]));
  let evidence,charter;
  try {
    evidence=aiEvidence(sources.evidence);charter=aiSafeParagraphs(sources.charter);
    if(!charter.length || JSON.stringify({evidence,charter}).length>150000) throw new Error('InvalidSources');
  } catch(e) {summary.status='source_unavailable';return summary;}
  summary.status='complete';
  const ordered=candidates.slice().sort((a,b)=>String(progress[jobKey(a)] || '').localeCompare(String(progress[jobKey(b)] || '')) || jobKey(a).localeCompare(jobKey(b)));
  for(const job of ordered) {
    // Reserve an entire request window plus output-save margin. The soft deadline
    // cannot cancel UrlFetchApp in flight; Google's runtime remains the hard limit.
    const remaining=RUN_CLOCK?RUN_CLOCK.budget-(Date.now()-RUN_CLOCK.start):0;
    if(summary.attempted>=settings.maxJobs || remaining<60000 || summary.failed) {summary.deferred++;continue;}
    if(job.employer_live_verified!==true || job.requires_employer_verification===true) {summary.deferred++;continue;}
    summary.attempted++;
    state.ai_scoring_progress[jobKey(job)]=new Date().toISOString();
    try {job.scoring=aiAssess(job,evidence,charter,config,settings);summary.assessed++;}
    catch(e) {summary.failed++;} // Intentionally never log exception, response, prompt or key.
  }
  if(summary.failed || summary.deferred) summary.status='partial';
  return summary;
}
function aiScoreLines(job) {
  const s=job.scoring;
  if(!s) return ['Collector only: fit unassessed; human evidence review required.'];
  return ['Assessment: '+s.decision+' · '+s.score+'/100 · confidence '+s.confidence+'/100',
    'Human approval required. '+s.rationale,
    'Dimensions: '+JSON.stringify(s.dimension_scores),
    'Strongest evidence: '+JSON.stringify(s.strongest_evidence),
    'Transferable evidence: '+JSON.stringify(s.transferable_evidence),
    'Gaps: '+JSON.stringify(s.gaps),'Blockers: '+JSON.stringify(s.blockers),
    'Questions: '+JSON.stringify(s.questions)];
}
