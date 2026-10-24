import {searchHiringCafe} from './hiringcafe.js';
import {discoverSourceLead} from './source-registry.js';

// Discovery is deliberately separate from the public verified index. Results
// from HiringCafe are leads until their employer source is checked.
export async function discoverPublicLeads(filters, options = {}) {
  const response = await searchHiringCafe(filters, options);
  const records = Array.isArray(response.results) ? response.results : response.results?.jobs || [];
  const leads = records.map(record => {
    const employerUrl = record.employer_url || record.application_url || record.url;
    const source = employerUrl ? discoverSourceLead(employerUrl, response.retrieved_at) : null;
    return {...record, discovery_source:'hiringcafe', requires_employer_verification:true, employer_source:source};
  });
  return {source:response.source,retrieved_at:response.retrieved_at,leads};
}
