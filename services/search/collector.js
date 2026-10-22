import {normalizePublicJob, upsertPublicJobs} from './index.js';

// Convert only employer-verified collector candidates into the public index.
// Discovery leads and personal evaluation fields stay in the private layer.
export function publicJobsFromCollectorReport(report) {
  if (!report || typeof report !== 'object' || !Array.isArray(report.candidates)) throw new Error('Collector report needs a candidates array.');
  const checkedAt = typeof report.checked_at === 'string' ? report.checked_at : null;
  return report.candidates
    .filter(job => job && job.employer_live_verified === true && job.requires_employer_verification !== true)
    .map(job => normalizePublicJob({company:job.company,title:job.title,location:job.location,url:job.url,description:job.description,provider:job.provider,published_at:job.published_at,live_checked_at:job.live_checked_at,active:true}, checkedAt));
}

export function upsertCollectorReport(index, report) { return upsertPublicJobs(index, publicJobsFromCollectorReport(report), report?.checked_at || null); }
