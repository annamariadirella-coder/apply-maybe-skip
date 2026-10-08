import {screenJob} from './triage/screen-job.js';
export function evaluateJob(job,profile,{configured=true,now=Date.now(),requireLiveCheck=true}={}) {
 const blocked=reason=>({verdict:'Blocked',score:null,confidence:null,explanation:reason,strongestMatches:[],keyGaps:[reason],blockers:[],mode:'triage'});
 if(!configured)return blocked('Set up your own profile before reviewing real roles.');
 if(String(job.description||'').trim().length<200)return blocked('The full job description is missing. Import a complete description.');
 const result=screenJob({title:job.title,location:job.location,text:job.description,url:job.url},{...profile,scoring:{...profile.scoring,thresholds:{apply:80,maybe:65}}});
 const checked=Date.parse(job.live_checked_at||'');const verified=job.demo||job.employer_live_verified&&Number.isFinite(checked)&&checked<=now+60000&&now-checked<48*3600000&&!job.requires_employer_verification;
 const reviewRisks=result.requirementRiskCounts?.unknown??0;
 const verdict=result.verdict==='Skip'?'Skip':requireLiveCheck&&!verified?'Blocked':reviewRisks?'Maybe':result.verdict;
 return {...result,verdict,confidence:null,mode:'triage',fit_assessed:false,explanation:requireLiveCheck&&!verified&&result.verdict!=='Skip'?'Recheck the original employer posting. This role has no recent employer verification.':result.explanation,live_verified:!!verified,human_approval_required:true};
}
