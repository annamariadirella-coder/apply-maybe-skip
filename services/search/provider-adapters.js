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
  // Some live tenants report total=0 while still returning postings. Treat
  // that contradictory value as unknown rather than complete.
  const total = Number.isFinite(body?.total) && !(body.total === 0 && rows.length) ? body.total : null;
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

export function parseProviderResponse(provider, payload, employerUrl, company = '') {
  if (provider === 'workday') return parseWorkdayResponse(payload, employerUrl, company);
  if (provider === 'successfactors') return parseSuccessFactorsTiles(String(payload || ''), employerUrl, company);
  if (provider === 'oraclecloud') return parseOracleResponse(payload, employerUrl, company);
  throw new Error(`Unsupported provider adapter: ${provider}`);
}

function assertProviderUrl(provider, value) {
  const url = new URL(value);
  if (url.protocol !== 'https:') throw new Error('Provider source requires HTTPS.');
  const host = url.hostname.toLowerCase();
  const allowed = provider === 'workday' ? /\.wd\d+\.myworkdayjobs\.com$/ : provider === 'successfactors' ? /successfactors\.(?:com|eu)$/ : provider === 'oraclecloud' ? /oraclecloud\.com$/ : null;
  if (!allowed || !allowed.test(host)) throw new Error(`Untrusted ${provider} host.`);
  return url;
}

export async function fetchProviderPage(source, fetchImpl = globalThis.fetch) {
  if (!source?.provider || !source?.url) throw new Error('Provider source needs provider and URL.');
  const page = assertProviderUrl(source.provider, source.url);
  let url = page.href;
  const options = {redirect:'error', headers:{accept:'application/json, text/html;q=0.9'}};
  if (source.provider === 'workday') {
    url = resolveWorkdayEndpoint(page.href);
    options.method = 'POST';
    options.headers = {...options.headers, 'content-type':'application/json'};
    options.body = JSON.stringify({limit:20,offset:0,searchText:'',appliedFacets:[]});
  } else if (source.provider === 'successfactors') {
    url = new URL('/tile-search-results/?startrow=0', page.origin).href;
  }
  const response = await fetchImpl(url, options);
  if (!response?.ok) throw new Error(`HTTP ${response?.status || 'unknown'}`);
  const payload = source.provider === 'successfactors' ? await response.text() : await response.json();
  return parseProviderResponse(source.provider, payload, source.url, source.company || '');
}

export async function fetchWorkdayPages(source, {maxPages = 3, fetchImpl = globalThis.fetch} = {}) {
  if (source?.provider !== 'workday') throw new Error('Workday source required.');
  const page = assertProviderUrl('workday', source.url);
  const endpoint = resolveWorkdayEndpoint(page.href);
  const limit = 20;
  const jobs = [];
  let total = null;
  let pages = 0;
  let lastPageSize = 0;
  while (pages < Math.max(1, Math.min(Number(maxPages) || 1, 10))) {
    const response = await fetchImpl(endpoint, {method:'POST',redirect:'error',headers:{accept:'application/json','content-type':'application/json'},body:JSON.stringify({limit,offset:pages * limit,searchText:'',appliedFacets:[]})});
    if (!response?.ok) throw new Error(`HTTP ${response?.status || 'unknown'}`);
    const parsed = parseWorkdayResponse(await response.json(), source.url, source.company || '');
    total = parsed.total;
    jobs.push(...parsed.jobs);
    lastPageSize = parsed.jobs.length;
    pages++;
    if ((total !== null && jobs.length >= total) || !parsed.jobs.length) break;
  }
  const complete = total !== null ? jobs.length >= total : lastPageSize < limit;
  return {jobs,total,pages,complete,status:complete ? 'ok':'incomplete'};
}
