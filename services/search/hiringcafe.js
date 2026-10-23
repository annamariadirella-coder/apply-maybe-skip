const ENDPOINT = 'https://hiringcafe.com/api/chatgpt/mcp';

async function rpc(fetchImpl, payload, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(ENDPOINT, {method:'POST',headers:{'content-type':'application/json','accept':'application/json, text/event-stream'},body:JSON.stringify(payload),signal:controller.signal});
    if (response.status === 429) throw new Error('HiringCafe rate limit (429).');
    if (!response.ok) throw new Error(`HiringCafe HTTP ${response.status}.`);
    const text = await response.text();
    const line = text.split('\n').find(value => value.startsWith('data:'));
    return JSON.parse((line ? line.slice(5) : text).trim());
  } finally { clearTimeout(timer); }
}

// Bounded, read-only discovery. Keep this as a complement to employer ATS
// sources; never treat its response as live until the employer URL is checked.
export async function searchHiringCafe(filters, {fetchImpl=globalThis.fetch, timeoutMs=15000} = {}) {
  if (!fetchImpl) throw new Error('A fetch implementation is required.');
  const init = await rpc(fetchImpl, {jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2025-03-26',capabilities:{},clientInfo:{name:'jobops',version:'1.0'}}}, timeoutMs);
  if (init.error) throw new Error(init.error.message || 'HiringCafe initialize failed.');
  const result = await rpc(fetchImpl, {jsonrpc:'2.0',id:2,method:'tools/call',params:{name:'search_hiringcafe_jobs',arguments:{...filters,limit:Math.min(Number(filters.limit || 10),10)}}}, timeoutMs);
  if (result.error) throw new Error(result.error.message || 'HiringCafe search failed.');
  return {source:'hiringcafe',retrieved_at:new Date().toISOString(),requires_employer_verification:true,results:result.result?.structuredContent || result.result?.content || []};
}
