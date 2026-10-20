// Local, conservative phrase parsing. No model calls and no evidence inference.
const rules = [
  ['targetRoles', /^(?:cerco(?: ruoli (?:in|come))?|mi interessano|i am looking for|i'm looking for|target roles:)\s+(.+)$/i],
  ['potentialRoles', /^(?:valuto anche|considero anche|i would also consider|adjacent roles:)\s+(.+)$/i],
  ['skipRoles', /^(?:escludo|evito|i want to avoid|excluded roles:)\s+(.+)$/i],
  ['preferredLocations', /^(?:preferisco lavorare (?:a|in)|vorrei lavorare (?:a|in)|i prefer to work in|preferred locations:)\s+(.+)$/i],
  ['preferredSeniority', /^(?:seniority:|livello:)\s+(.+)$/i],
  ['unavailableLanguages', /^(?:non parlo|i do not speak|i don't speak|unavailable languages:)\s+(.+)$/i],
  ['verifiedLanguages', /^(?:parlo|i speak|languages:)\s+(.+)$/i],
];

export function parseProfileIntent(text) {
  if (typeof text !== 'string' || text.length > 10000) throw new Error('Use up to 10,000 characters for your search preferences.');
  const suggestions = {}, recognized = [], unparsed = [];
  for (const clause of text.split(/[\n;.!?]+/).map(s => s.trim()).filter(Boolean)) {
    const rule = rules.map(([field, pattern]) => ({field, match: clause.match(pattern)})).find(r => r.match);
    // Conditional/negative preferences need a human decision, never a broad
    // positive location, language or role signal inferred from a keyword.
    if (!rule || /\b(?:non|not|except|tranne|eccetto|unless|se|if|ma|but|senza|without|oppure|or)\b/i.test(rule.match[1])) {
      unparsed.push(clause); continue;
    }
    const values = rule.match[1].split(',').map(s => s.trim()).filter(Boolean);
    if (!values.length || values.some(v => v.length > 100)) {unparsed.push(clause);continue;}
    suggestions[rule.field] = mergeIntentValues(suggestions[rule.field] || [], values);
    recognized.push({field: rule.field, clause, values});
  }
  // Conflicting language/role declarations are not silently resolved.
  for (const [positive, negative] of [['verifiedLanguages','unavailableLanguages'],['targetRoles','skipRoles']]) {
    const conflicts = (suggestions[positive] || []).filter(v => (suggestions[negative] || []).some(n => n.toLowerCase() === v.toLowerCase()));
    if (conflicts.length) {
      for (const field of [positive, negative]) suggestions[field] = suggestions[field].filter(v => !conflicts.some(c => c.toLowerCase() === v.toLowerCase()));
      unparsed.push('Resolve conflicting preferences: ' + conflicts.join(', '));
    }
  }
  return {text, suggestions, recognized, unparsed};
}

export function mergeIntentValues(current, incoming) {
  return [...new Map([...current, ...incoming].map(value => [value.toLowerCase(), value])).values()];
}
