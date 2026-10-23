// Small, dependency-free parsers for public ATS responses. They deliberately
// return an explicit completeness flag: a first page is never treated as a
// complete employer source when the provider reports more results.

export function resolveWorkdayEndpoint(url) {
  const parsed = new URL(url);
  if (!/^https:$/.test(parsed.protocol) || !/\.wd\d+\.myworkdayjobs\.com$/i.test(parsed.hostname)) return null;
  const parts = parsed.pathname.split('/').filter(Boolean);
  const tenant = parsed.hostname.split('.')[0];
  const site = parts.at(-1) || '';
  if (!tenant || !site) return null;
  return `${parsed.origin}/wday/cxs/${tenant}/${site}/jobs`;
}

export function parseWorkdayResponse(body, employerUrl, company = '') {
  const rows = Array.isArray(body?.jobPostings) ? body.jobPostings : [];
  const total = Number.isFinite(body?.total) ? body.total : null;
  const jobs = rows.filter(row => row && row.externalPath && row.title).map(row => ({
    provider: 'workday', company, title: String(row.title).trim(),
    url: new URL(row.externalPath, employerUrl).href,
    location: String(row.locationsText || '').trim(),
    posted_at: row.postedOn || null
  }));
  return {jobs, total, complete: total === null || jobs.length >= total, status: total !== null && jobs.length < total ? 'incomplete' : 'ok'};
}

export function parseSuccessFactorsTiles(html, employerUrl, company = '') {
  const jobs = [];
  const tileRe = /<li[^>]*class=["'][^"']*job-tile[^"']*["'][\s\S]*?<\/li>/gi;
  for (const match of String(html || '').matchAll(tileRe)) {
    const tile = match[0];
    const href = tile.match(/(?:data-url|href)=["']([^"']+)["']/i)?.[1];
    const title = tile.match(/class=["'][^"']*(?:jobTitle|job-title)[^"']*["'][^>]*>([\s\S]*?)<\//i)?.[1];
    if (!href || !title) continue;
    jobs.push({provider:'successfactors',company,title:title.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim(),url:new URL(href, employerUrl).href,location:''});
  }
  return {jobs, total:null, complete:true, status:'ok'};
}

export function parseOracleResponse(body, employerUrl, company = '') {
  const rows = Array.isArray(body?.items) ? body.items : Array.isArray(body?.requisitions) ? body.requisitions : [];
  const jobs = rows.filter(row => row && (row.title || row.jobTitle) && (row.externalUrl || row.jobUrl || row.requisitionId)).map(row => ({
    provider:'oraclecloud', company, title:String(row.title || row.jobTitle).trim(),
    url:new URL(row.externalUrl || row.jobUrl || `/hcmUI/CandidateExperience/en/sites/Careers/job/${row.requisitionId}`, employerUrl).href,
    location:String(row.location || row.primaryLocation || '').trim()
  }));
  const total = Number.isFinite(body?.totalResults) ? body.totalResults : null;
  return {jobs,total,complete:total === null || jobs.length >= total,status:total !== null && jobs.length < total ? 'incomplete':'ok'};
}
