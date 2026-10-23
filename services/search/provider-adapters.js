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

export function parseIcmsJobs(html, employerUrl, company = '') {
  const jobs = [];
  const cards = String(html || '').match(/<li[^>]*class=["'][^"']*iCIMS_JobCardItem[^"']*["'][\s\S]*?<\/li>/gi) || [];
  for (const card of cards) {
    const anchor = card.match(/<a[^>]+href=["']([^"']*\/jobs\/[^"']+)["'][^>]*>[\s\S]*?<h3[^>]*>([\s\S]*?)<\/h3>/i);
    if (!anchor) continue;
    const title = anchor[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!title) continue;
    const location = card.match(/Job Locations[\s\S]*?<span[^>]*>\s*([^<]+?)\s*<\/span>/i)?.[1]?.trim() || '';
    jobs.push({provider:'icims', company, title, url:new URL(anchor[1], employerUrl).href, location});
  }
  return {jobs,total:null,complete:true,status:'ok'};
}

export function parseSoftgardenResponse(body, employerUrl, company = '') {
  const rows = Array.isArray(body?.dataFeedElement) ? body.dataFeedElement : Array.isArray(body?.itemListElement) ? body.itemListElement : Array.isArray(body?.items) ? body.items : [];
  const jobs = rows.map(row => row?.item || row).filter(row => row && (row.title || row.name) && (row.url || row['@id'])).map(row => ({
    provider:'softgarden', company, title:String(row.title || row.name).trim(),
    url:new URL(row.url || row['@id'], employerUrl).href,
    location:typeof row.jobLocation === 'string' ? row.jobLocation : String(row.jobLocation?.address?.addressLocality || row.location || '').trim(),
    posted_at:row.datePosted || null
  }));
  return {jobs,total:null,complete:true,status:'ok'};
}

export function parseOracleResponse(body, employerUrl, company = '') {
  const item = Array.isArray(body?.items) ? body.items[0] : null;
  const rows = Array.isArray(item?.requisitionList) ? item.requisitionList : Array.isArray(body?.requisitions) ? body.requisitions : Array.isArray(body?.items) ? body.items : [];
  const jobs = rows.filter(row => row && (row.title || row.jobTitle || row.Title) && (row.externalUrl || row.jobUrl || row.ExternalURL || row.requisitionId || row.Id)).map(row => ({
    provider:'oraclecloud', company, title:String(row.title || row.jobTitle || row.Title).trim(),
    url:new URL(row.externalUrl || row.jobUrl || row.ExternalURL || `/hcmUI/CandidateExperience/${typeof employerUrl === 'object' ? employerUrl.lang : 'en'}/sites/${typeof employerUrl === 'object' ? employerUrl.siteNumber : 'CX_1'}/job/${row.requisitionId || row.Id}`, typeof employerUrl === 'string' ? employerUrl : `https://${employerUrl.host}`).href,
    location:String(row.location || row.primaryLocation || row.PrimaryLocation || '').trim()
  }));
  const total = Number.isFinite(body?.totalResults) ? body.totalResults : Number.isFinite(item?.TotalJobsCount) ? item.TotalJobsCount : null;
  return {jobs,total,complete:total === null || jobs.length >= total,status:total !== null && jobs.length < total ? 'incomplete':'ok'};
}

const ORACLE_HOST = /^[a-z0-9-]+\.fa\.(?:[a-z0-9-]+\.)?(?:ocs\.)?oraclecloud(?:[1-9][0-9]?)?\.com$/i;

export function resolveOracleSite(url) {
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:' || !ORACLE_HOST.test(parsed.hostname)) return null;
  const parts = parsed.pathname.split('/').filter(Boolean);
  const ce = parts.indexOf('CandidateExperience');
  const lang = ce >= 0 && parts[ce + 1] ? parts[ce + 1] : 'en';
  const sites = parts.indexOf('sites');
  const siteNumber = sites >= 0 && parts[sites + 1] ? parts[sites + 1] : 'CX_1';
  return {host: parsed.hostname, lang, siteNumber};
}

export function buildOracleEndpoint(site, offset = 0, limit = 50) {
  const finder = `findReqs;siteNumber=${site.siteNumber},facetsList=LOCATIONS%3BWORK_LOCATIONS%3BWORKPLACE_TYPES%3BTITLES%3BCATEGORIES%3BORGANIZATIONS%3BPOSTING_DATES%3BFLEX_FIELDS,limit=${limit},sortBy=POSTING_DATES_DESC,offset=${offset}`;
  return `https://${site.host}/hcmRestApi/resources/latest/recruitingCEJobRequisitions?onlyData=true&expand=${encodeURIComponent('requisitionList.workLocation,requisitionList.secondaryLocations')}&finder=${finder}&limit=${limit}&offset=${offset}`;
}

export function parseProviderResponse(provider, payload, employerUrl, company = '') {
  if (provider === 'workday') return parseWorkdayResponse(payload, employerUrl, company);
  if (provider === 'successfactors') return parseSuccessFactorsTiles(String(payload || ''), employerUrl, company);
  if (provider === 'icims') return parseIcmsJobs(String(payload || ''), employerUrl, company);
  if (provider === 'softgarden') return parseSoftgardenResponse(payload, employerUrl, company);
  if (provider === 'oraclecloud') return parseOracleResponse(payload, employerUrl, company);
  throw new Error(`Unsupported provider adapter: ${provider}`);
}

function assertProviderUrl(provider, value) {
  const url = new URL(value);
  if (url.protocol !== 'https:') throw new Error('Provider source requires HTTPS.');
  const host = url.hostname.toLowerCase();
  const allowed = provider === 'workday' ? /\.wd\d+\.myworkdayjobs\.com$/ : provider === 'successfactors' ? /successfactors\.(?:com|eu)$/ : provider === 'oraclecloud' ? ORACLE_HOST : provider === 'icims' ? /(?:careers|uscareers)-[a-z0-9-]+\.icims\.com$/i : provider === 'softgarden' ? /(?:\.career\.softgarden\.de|\.softgarden\.io)$/i : null;
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
    const basePath = page.pathname.replace(/\/(?:search|tile-search-results)\/?$/i, '').replace(/\/+$/, '');
    url = `${page.origin}${basePath}/tile-search-results/?startrow=0`;
  } else if (source.provider === 'oraclecloud') {
    const site = resolveOracleSite(page.href);
    if (!site) throw new Error('Oracle Cloud career URL is not recognized.');
    url = buildOracleEndpoint(site, 0, 50);
  } else if (source.provider === 'icims') {
    url = `${page.origin}/jobs/search?ss=1&pr=0&in_iframe=1`;
  } else if (source.provider === 'softgarden') {
    url = `${page.origin}/jobs.feed.json`;
  }
  const response = await fetchImpl(url, options);
  if (!response?.ok) throw new Error(`HTTP ${response?.status || 'unknown'}`);
  const payload = ['successfactors','icims'].includes(source.provider) ? await response.text() : await response.json();
  return parseProviderResponse(source.provider, payload, source.url, source.company || '');
}

export async function fetchIcmsPages(source, {maxPages = 10, fetchImpl = globalThis.fetch} = {}) {
  if (source?.provider !== 'icims') throw new Error('iCIMS source required.');
  const page = assertProviderUrl('icims', source.url);
  const jobs = [];
  let pages = 0;
  let complete = false;
  const cap = Math.max(1, Math.min(Number(maxPages) || 1, 20));
  while (pages < cap) {
    const url = `${page.origin}/jobs/search?ss=1&pr=${pages}&in_iframe=1`;
    const response = await fetchImpl(url, {redirect:'error',headers:{accept:'text/html'}});
    if (!response?.ok) throw new Error(`HTTP ${response?.status || 'unknown'}`);
    const parsed = parseIcmsJobs(await response.text(), source.url, source.company || '');
    jobs.push(...parsed.jobs);
    pages++;
    if (!parsed.jobs.length) { complete = true; break; }
  }
  return {jobs,total:null,pages,complete,status:complete ? 'ok':'incomplete'};
}

export async function fetchOraclePages(source, {maxPages = 3, fetchImpl = globalThis.fetch} = {}) {
  if (source?.provider !== 'oraclecloud') throw new Error('Oracle Cloud source required.');
  const page = assertProviderUrl('oraclecloud', source.url);
  const site = resolveOracleSite(page.href);
  if (!site) throw new Error('Oracle Cloud career URL is not recognized.');
  const jobs = [];
  let total = null;
  let pages = 0;
  const limit = 50;
  while (pages < Math.max(1, Math.min(Number(maxPages) || 1, 10))) {
    const response = await fetchImpl(buildOracleEndpoint(site, pages * limit, limit), {redirect:'error', headers:{accept:'application/json'}});
    if (!response?.ok) throw new Error(`HTTP ${response?.status || 'unknown'}`);
    const body = await response.json();
    const parsed = parseOracleResponse(body, site, source.company || '');
    jobs.push(...parsed.jobs);
    total = parsed.total;
    pages++;
    if (!parsed.jobs.length || (total !== null && jobs.length >= total)) break;
  }
  const complete = total !== null ? jobs.length >= total : pages < Math.max(1, Math.min(Number(maxPages) || 1, 10));
  return {jobs,total,pages,complete,status:complete ? 'ok':'incomplete'};
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
