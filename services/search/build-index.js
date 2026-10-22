import {readFile} from 'node:fs/promises';
import {upsertCollectorReport} from './collector.js';

// Build the public index from explicit collector reports. Callers decide where
// reports come from; this module never reads private profile or Tracker data.
export async function buildPublicIndex(reportPaths, existing = [], checkedAt = new Date().toISOString()) {
  let index = existing;
  for (const path of reportPaths) {
    const report = JSON.parse(await readFile(path, 'utf8'));
    index = upsertCollectorReport(index, report);
  }
  return index.map(job => ({...job, last_seen_at: job.last_seen_at || checkedAt}));
}
