import {canonicalUrl} from '../../core/jobs.js';

const ATS = {
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
};

function providerFor(url) {
  const host = new URL(url).hostname.toLowerCase().replace(/^www\./, '');
  return Object.entries(ATS).find(([, hosts]) => hosts.some(value => host === value || host.endsWith(`.${value}`)))?.[0] || 'employer_careers';
}

export function verifyEmployerSource(lead, employerUrl, checkedAt = new Date().toISOString()) {
  if (!lead || lead.source_kind === 'unknown' && !lead.url) throw new Error('A reviewable link lead is required.');
  const url = canonicalUrl(employerUrl);
  const original = canonicalUrl(lead.url);
  if (new URL(url).hostname.toLowerCase().includes('hiring.cafe')) throw new Error('Employer source must leave HiringCafe.');
  return {
    ...lead,
    url,
    source_url: original,
    provider: providerFor(url),
    source_kind: 'employer_source',
    status: 'awaiting_live_check',
    employer_live_verified: false,
    requires_employer_verification: true,
    source_checked_at: checkedAt
  };
}
