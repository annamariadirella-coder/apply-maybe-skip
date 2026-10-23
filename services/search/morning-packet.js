const DECISIONS = new Set(['APPLY','MAYBE','SKIP']);

function list(value) { return Array.isArray(value) ? value.filter(item => item && typeof item === 'object') : []; }

// Normalizes the scan contract consumed by the Morning Desk. The packet may
// contain private fit notes locally, but the public index never receives it.
export function normalizeMorningPacket(raw) {
  if (!raw || typeof raw !== 'object') throw new Error('Morning packet must be an object.');
  const verified = list(raw.verified).map(item => ({
    decision: DECISIONS.has(item.decision) ? item.decision : 'MAYBE',
    title: String(item.title || '').trim(), company: String(item.company || '').trim(),
    location: String(item.location || 'Unknown').trim(), workplace: String(item.workplace || 'unknown').trim(),
    employer_url: String(item.employer_url || item.url || '').trim(), source: String(item.discovery_source || item.source || 'unknown').trim(),
    reason: String(item.reason || '').trim(), verified_at: item.verified_at || null
  })).filter(item => item.title && item.company && /^https:\/\//i.test(item.employer_url));
  const pending = list(raw.to_verify).map(item => ({
    title: String(item.title || '').trim(), company: String(item.company || '').trim(),
    url: String(item.url || item.employer_url || '').trim(), source: String(item.source || item.discovery_source || 'unknown').trim(),
    reason: String(item.reason || 'Employer source still needs verification.').trim()
  })).filter(item => item.title && item.company && /^https?:\/\//i.test(item.url));
  const unavailable = list(raw.unavailable_sources).map(item => ({provider:String(item.provider || 'unknown'), company:String(item.company || 'unknown'), endpoint:String(item.endpoint || ''), error:String(item.error || 'unavailable'), alternative:String(item.alternative || '')}));
  return {scan_date: raw.scan_date || null, coverage: raw.coverage || null, summary: raw.summary || {APPLY:0,MAYBE:0,SKIP:0}, verified, to_verify:pending, unavailable_sources:unavailable, generated_at: raw.generated_at || new Date().toISOString()};
}
