// Compatibility catalog for the MIT-licensed Career Ops provider layer.
// This is a provider-family inventory, not a company allowlist: runtime source
// discovery remains dynamic and no employer is added by this file.
export const CAREER_OPS_PROVIDER_FAMILIES = Object.freeze([
  'ashby','avature','bamboohr','breezy','comeet','csod','eightfold','gem',
  'greenhouse','icims','jibeapply','jobvite','join','lever','oraclecloud',
  'personio','phenom','pinpoint','radancy','recruitee','rippling',
  'smartrecruiters','successfactors','teamtailor','workable','workday'
]);

export function providerFamilyCoverage(availableFamilies) {
  const available = new Set((Array.isArray(availableFamilies) ? availableFamilies : [])
    .map(value => String(value || '').trim().toLowerCase()).filter(Boolean));
  const covered = CAREER_OPS_PROVIDER_FAMILIES.filter(family => available.has(family));
  const missing = CAREER_OPS_PROVIDER_FAMILIES.filter(family => !available.has(family));
  return {catalogued: CAREER_OPS_PROVIDER_FAMILIES.length, covered, missing, coverage_ratio: CAREER_OPS_PROVIDER_FAMILIES.length ? covered.length / CAREER_OPS_PROVIDER_FAMILIES.length : 1};
}
