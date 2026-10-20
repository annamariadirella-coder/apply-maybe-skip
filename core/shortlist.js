import {evaluateJob} from './evaluate.js';
import {jobKey,safeUrl} from './jobs.js';

export function semanticQuery(settings) {
 return JSON.stringify({targetRoles:settings?.targetRoles||[],potentialRoles:settings?.potentialRoles||[],strengths:settings?.strengths||[]});
}
export const semanticDocument=job=>[job.title||'',job.location||'',job.description||''].join('\n');
export function semanticScore(job,settings){
 const s=job.semantic;
 return s&&s.query===semanticQuery(settings)&&s.document===semanticDocument(job)&&typeof s.score==='number'&&Number.isFinite(s.score)&&s.score>=-1&&s.score<=1?s.score:null;
}
// Shortlist is preliminary triage, not a validated evidence assessment. Semantic
// similarity only orders candidates that independently pass existing gates.
export function buildShortlist(jobs,profile,settings,{now=Date.now()}={}) {
 const unique=new Map(),excluded=new Set();
 for(const job of jobs){
  if(!safeUrl(job.url)||!['To review','Shortlisted',undefined].includes(job.status)){excluded.add(jobKey(job));continue;}
  const result=evaluateJob(job,profile,{configured:!!settings?.configured,now});
  if(!['Apply','Maybe'].includes(result.verdict)||!result.live_verified||result.blockers?.length){excluded.add(jobKey(job));continue;}
  if(!(result.scoreBreakdown?.relevantStrengths?.score>0))continue;
  const item={job,result,semantic:semanticScore(job,settings),reason:result.explanation,gaps:result.keyGaps||[],human_approval_required:true};
  const key=jobKey(job),old=unique.get(key);
  // Conservatively retain the less positive duplicate instead of bypassing a gap.
  if(!old||result.score<old.result.score)unique.set(key,item);
 }
 const rank=(a,b)=>(b.semantic??-2)-(a.semantic??-2)||b.result.score-a.result.score||jobKey(a.job).localeCompare(jobKey(b.job));
 const pool=[...unique.values()].filter(x=>!excluded.has(jobKey(x.job))),companies=new Set();
 const select=(items,cap)=>{
  const ordered=items.sort(rank),selected=[];
  for(const item of ordered)if(!companies.has(item.job.company.toLowerCase())&&selected.length<cap){selected.push(item);companies.add(item.job.company.toLowerCase());}
  for(const item of ordered)if(!selected.includes(item)&&selected.length<cap)selected.push(item);
  return selected;
 };
 const strong=select(pool.filter(x=>x.result.verdict==='Apply'&&!x.gaps.length&&!Object.values(x.result.requirementRiskCounts||{}).some(n=>n>0)),3);
 const wildcards=select(pool.filter(x=>x.result.verdict==='Maybe'&&x.gaps.length>0),2);
 return {strong,wildcards,unfilled:{strong:3-strong.length,wildcards:2-wildcards.length},mode:'preliminary_triage',fit_assessed:false};
}
