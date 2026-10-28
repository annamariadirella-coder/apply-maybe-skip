import {safeUrl, canonicalUrl} from '../../core/jobs.js';

const patterns = [
  ['greenhouse', /(?:boards|job-boards)(?:\.eu)?\.greenhouse\.io\/[^/]+\/jobs\/\d+/i],
  ['lever', /jobs(?:\.eu)?\.lever\.co\/[^/]+\//i],
  ['ashby', /jobs\.ashbyhq\.com\/[^/]+\//i],
  ['teamtailor', /\/jobs\/\d+(?:-|\/)/i],
  ['personio', /\.jobs\.personio\.(?:de|com)\/job\/\d+/i],
  ['recruitee', /\.recruitee\.com\/o\//i],
  ['smartrecruiters', /jobs\.smartrecruiters\.com\//i],
  ['workable', /(?:apply\.workable\.com|workable\.com\/[^/]+\/j)\//i],
  ['workday', /[a-z0-9-]+\.wd\d+\.myworkdayjobs\.com\//i],
  ['successfactors', /successfactors\.(?:com|eu)\//i],
  ['oraclecloud', /oraclecloud\.com\/hcmUI\/CandidateExperience\//i]
  ,['icims', /(?:careers|uscareers)-[^/]+\.icims\.com\/jobs\//i]
  ,['softgarden', /(?:\.career\.softgarden\.de|\.softgarden\.io)\//i]
  ,['bamboohr', /\.bamboohr\.com\/careers\//i]
  ,['personio', /\.jobs\.personio\.(?:de|com)\/job\//i]
  ,['jobvite', /jobs\.jobvite\.com\/[^/]+\/job\//i]
];

export function intakeLink(value, receivedAt = new Date().toISOString()) {
  const url = safeUrl(value);
  if (!url) throw new Error('A link intake needs an ordinary http(s) URL.');
  const canonical = canonicalUrl(url);
  const hiringCafe = new URL(canonical).hostname.toLowerCase().endsWith('hiringcafe.com');
  const match = patterns.find(([, pattern]) => pattern.test(canonical));
  return {
    url: canonical,
    source_url: canonical,
    source_kind: hiringCafe ? 'hiringcafe' : match ? 'employer_ats' : 'unknown',
    detected_provider: match?.[0] || null,
    received_at: receivedAt,
    requires_employer_verification: true,
    employer_live_verified: false,
    status: 'awaiting_employer_source'
  };
}
