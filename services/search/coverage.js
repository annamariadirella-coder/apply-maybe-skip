// Provider-neutral source rotation and coverage diagnostics. State is supplied
// by the caller so a private deployment can persist it without exposing it.
export function planSourceBatch(sources, state = {}, batchSize = 80, now = new Date().toISOString()) {
  const list = Array.isArray(sources) ? sources : [];
  const offset = Number.isInteger(state.cursor) ? state.cursor : 0;
  const eligible = list.filter(source => source && source.enabled !== false && !(source.retry_after && source.retry_after > now));
  const count = Math.min(batchSize, eligible.length);
  const batch = Array.from({length:count}, (_, index) => { const rotation_index=(offset + index) % eligible.length; return {...eligible[rotation_index], rotation_index, checked_at:now}; });
  return {batch, next_cursor: eligible.length ? (offset + batch.length) % eligible.length : 0, eligible_count:eligible.length, total_count:list.length};
}

export function recordSourceOutcome(source, outcome, now = new Date().toISOString()) {
  const status = outcome?.status || 'unavailable';
  const retryable = ['timeout','429','5xx','network'].includes(status);
  return {...source, last_checked_at:now, last_status:status, last_error:outcome?.error || null, retry_after:retryable ? new Date(Date.parse(now) + 6 * 60 * 60 * 1000).toISOString() : null, attempts:Number(source.attempts || 0) + 1};
}

export function coverageSummary(sources) {
  const list = Array.isArray(sources) ? sources : [];
  const successful = list.filter(source => source.last_status === 'ok').length;
  const unavailable = list.filter(source => source.last_status && source.last_status !== 'ok').length;
  return {total:list.length, enabled:list.filter(source => source.enabled !== false).length, checked:list.filter(source => source.last_checked_at).length, successful, unavailable, untested:list.filter(source => !source.last_checked_at).length, complete: list.length > 0 && list.every(source => source.last_status === 'ok')};
}
