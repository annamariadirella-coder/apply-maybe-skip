import {fetchProviderPage, fetchWorkdayPages, fetchOraclePages, fetchIcmsPages} from './provider-adapters.js';
import {normalizePublicJob, upsertPublicJobs} from './index.js';

// Public-source scan boundary. It never reads profiles, Tracker state or
// application data; every source gets an explicit diagnostic result.
export async function scanPublicSources(sources, {fetchImpl = globalThis.fetch, checkedAt = new Date().toISOString(), maxPages = 3} = {}) {
  const jobs = [];
  const diagnostics = [];
  for (const source of Array.isArray(sources) ? sources : []) {
    if (!source?.provider || !source?.url) {
      diagnostics.push({source: source?.url || null, provider: source?.provider || null, status:'invalid_source', jobs:0});
      continue;
    }
    try {
      const result = source.provider === 'workday'
        ? await fetchWorkdayPages(source, {maxPages, fetchImpl})
        : source.provider === 'oraclecloud'
          ? await fetchOraclePages(source, {maxPages, fetchImpl})
          : source.provider === 'icims'
            ? await fetchIcmsPages(source, {maxPages, fetchImpl})
            : await fetchProviderPage(source, fetchImpl);
      const normalized = result.jobs.map(job => normalizePublicJob({...job, source_url: source.url, checked_at: checkedAt, last_seen_at: checkedAt}, checkedAt));
      jobs.push(...normalized);
      diagnostics.push({source:source.url, provider:source.provider, status:result.status, complete:result.complete, jobs:normalized.length});
    } catch (error) {
      diagnostics.push({source:source.url, provider:source.provider, status:'unavailable', jobs:0, error:String(error?.message || error)});
    }
  }
  return {jobs:upsertPublicJobs([], jobs, checkedAt), diagnostics, checked_at:checkedAt};
}
