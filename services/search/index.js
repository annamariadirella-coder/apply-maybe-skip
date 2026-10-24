import {canonicalUrl, normalizeJob, jobKey} from '../../core/jobs.js';

// Provider-neutral public search index. It stores only public vacancy data;
// personal profiles, Tracker state and application decisions stay elsewhere.
export function normalizePublicJob(raw, checkedAt = null) {
  const job = normalizeJob(raw);
  if (!job.url) throw new Error('A public index record needs an employer URL.');
  return {
    ...job,
    url: canonicalUrl(job.url),
    source_url: canonicalUrl(raw.source_url || job.url),
    first_seen_at: typeof raw.first_seen_at === 'string' ? raw.first_seen_at : checkedAt,
    last_seen_at: typeof raw.last_seen_at === 'string' ? raw.last_seen_at : checkedAt,
    published_at: typeof raw.published_at === 'string' ? raw.published_at : null,
    salary: raw.salary && typeof raw.salary === 'object' ? {
      min: Number.isFinite(raw.salary.min) ? raw.salary.min : null,
      max: Number.isFinite(raw.salary.max) ? raw.salary.max : null,
      currency: String(raw.salary.currency || '').slice(0, 12),
      period: String(raw.salary.period || '').slice(0, 20),
      disclosed: raw.salary.disclosed === true
    } : null,
    workplace_type: ['remote', 'hybrid', 'onsite'].includes(String(raw.workplace_type || '').toLowerCase()) ? String(raw.workplace_type).toLowerCase() : 'unknown',
    employment_type: String(raw.employment_type || '').slice(0, 80),
    active: raw.active !== false,
    index_key: jobKey(job)
  };
}

export function upsertPublicJobs(existing, incoming, checkedAt = null) {
  const byKey = new Map(existing.map(job => [job.index_key || jobKey(job), job]));
  for (const raw of incoming) {
    const job = normalizePublicJob(raw, checkedAt);
    const old = byKey.get(job.index_key);
    byKey.set(job.index_key, {
      ...old,
      ...job,
      first_seen_at: old?.first_seen_at || job.first_seen_at,
      last_seen_at: job.last_seen_at || old?.last_seen_at
    });
  }
  return [...byKey.values()];
}

function text(job) { return `${job.company} ${job.title} ${job.location} ${job.description}`.toLowerCase(); }

export function searchPublicJobs(index, filters = {}) {
  const terms = String(filters.query || '').toLowerCase().split(/\s+/).filter(Boolean);
  const company = String(filters.company || '').toLowerCase();
  const location = String(filters.location || '').toLowerCase();
  const workplace = String(filters.workplace_type || '').toLowerCase();
  const salaryMin = Number.isFinite(filters.min_salary) ? filters.min_salary : null;
  return index.filter(job => {
    if (filters.active_only !== false && job.active === false) return false;
    if (company && !job.company.toLowerCase().includes(company)) return false;
    if (location && !job.location.toLowerCase().includes(location)) return false;
    if (workplace && job.workplace_type !== workplace) return false;
    if (salaryMin !== null && (!job.salary?.disclosed || Number(job.salary.max || 0) < salaryMin)) return false;
    const haystack = text(job);
    return terms.every(term => haystack.includes(term));
  }).sort((a, b) => String(b.last_seen_at || '').localeCompare(String(a.last_seen_at || '')));
}

export function publicIndexStats(index) {
  const active = index.filter(job => job.active !== false);
  return {
    total: index.length,
    active: active.length,
    employers: new Set(active.map(job => job.company.toLowerCase())).size,
    providers: [...new Set(active.map(job => job.provider))].sort(),
    with_disclosed_salary: active.filter(job => job.salary?.disclosed).length
  };
}
