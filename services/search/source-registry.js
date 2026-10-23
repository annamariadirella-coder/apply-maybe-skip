const ATS_HOSTS = {
  greenhouse: ['boards.greenhouse.io', 'job-boards.greenhouse.io'],
  lever: ['jobs.lever.co'],
  ashby: ['jobs.ashbyhq.com'],
  teamtailor: ['teamtailor.com'],
  personio: ['personio.com'],
  recruitee: ['recruitee.com'],
  smartrecruiters: ['smartrecruiters.com'],
  workable: ['apply.workable.com'],
  workday: ['myworkdayjobs.com'],
  successfactors: ['successfactors.com', 'successfactors.eu'],
  oraclecloud: ['oraclecloud.com']
  ,icims: ['icims.com'],
  softgarden: ['softgarden.de', 'softgarden.io']
  ,bamboohr: ['bamboohr.com'],
  personio: ['jobs.personio.de', 'jobs.personio.com'],
  jobvite: ['jobs.jobvite.com']
};

function providerFor(url) {
  const host = new URL(url).hostname.toLowerCase().replace(/^www\./, '');
  return Object.entries(ATS_HOSTS).find(([, hosts]) => hosts.some(value => host === value || host.endsWith(`.${value}`)))?.[0] || null;
}

// Convert public employer links into source leads. No source is promoted until
// a collector adapter confirms a live, parseable board response.
export function discoverSourceLead(url, discoveredAt = new Date().toISOString()) {
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:') throw new Error('Source discovery requires HTTPS.');
  const provider = providerFor(url) || (() => {
    const host = new URL(url).hostname.toLowerCase();
    if (/\.wd\d+\.myworkdayjobs\.com$/.test(host)) return 'workday';
    return null;
  })();
  if (!provider) return null;
  return {provider, url: parsed.origin + parsed.pathname, discovered_at: discoveredAt, status:'awaiting_validation', verified:false};
}

export function mergeSourceRegistry(existing, leads) {
  const byUrl = new Map(existing.map(source => [source.url, source]));
  for (const lead of leads) {
    if (!lead) continue;
    const previous = byUrl.get(lead.url);
    byUrl.set(lead.url, {...previous, ...lead, discovered_at: previous?.discovered_at || lead.discovered_at});
  }
  return [...byUrl.values()];
}
