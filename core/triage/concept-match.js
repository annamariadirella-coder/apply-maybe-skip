const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "as",
  "at",
  "by",
  "for",
  "from",
  "in",
  "of",
  "on",
  "or",
  "the",
  "to",
  "with",
]);

const TOKEN_ALIASES = new Map(
  Object.entries({
    adoption: "adopt",
    adopted: "adopt",
    adopting: "adopt",
    analytics: "analyze",
    analysis: "analyze",
    analytical: "analyze",
    automation: "automate",
    collaboration: "collaborate",
    collaborative: "collaborate",
    collaborated: "collaborate",
    communications: "communicate",
    communication: "communicate",
    dashboards: "dashboard",
    decisions: "decision",
    driven: "drive",
    engineering: "engineer",
    engineers: "engineer",
    execution: "execute",
    experimentation: "experiment",
    experiments: "experiment",
    functional: "function",
    initiatives: "initiative",
    leadership: "lead",
    leading: "lead",
    management: "manage",
    managed: "manage",
    managing: "manage",
    operations: "operate",
    operational: "operate",
    optimisation: "improve",
    optimization: "improve",
    optimise: "improve",
    optimize: "improve",
    improvement: "improve",
    partnerships: "partner",
    planning: "plan",
    plans: "plan",
    prioritisation: "prioritize",
    prioritization: "prioritize",
    prioritise: "prioritize",
    reporting: "report",
    reports: "report",
    stakeholders: "stakeholder",
    strategic: "strategy",
    strategies: "strategy",
    transformation: "transform",
    workflows: "workflow",
  }),
);

const DISTINCTIVE_SINGLE_TOKENS = new Set([
  "ai",
  "aws",
  "confluence",
  "dashboard",
  "databricks",
  "forecasting",
  "github",
  "jira",
  "looker",
  "metabase",
  "monetisation",
  "monetization",
  "notion",
  "okr",
  "pricing",
  "sql",
]);

function normalizedWords(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9+#]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) => !STOP_WORDS.has(token))
    .map((token) => TOKEN_ALIASES.get(token) ?? token);
}

export function conceptTokens(value = "") {
  return [...new Set(normalizedWords(value))];
}

function hasStakeholderRelationship(candidate, segment) {
  const candidateSet = new Set(candidate);
  const segmentSet = new Set(segment);
  const relationshipTokens = ["manage", "partner", "collaborate", "engage"];

  return (
    candidateSet.has("stakeholder") &&
    segmentSet.has("stakeholder") &&
    relationshipTokens.some((token) => candidateSet.has(token)) &&
    relationshipTokens.some((token) => segmentSet.has(token))
  );
}

function hasAiChangeConcept(candidate, segment) {
  const candidateSet = new Set(candidate);
  const segmentSet = new Set(segment);
  const changeTokens = ["adopt", "automate", "transform", "workflow"];

  return (
    candidateSet.has("ai") &&
    segmentSet.has("ai") &&
    changeTokens.some((token) => candidateSet.has(token)) &&
    changeTokens.some((token) => segmentSet.has(token))
  );
}

export function conceptuallyMatches(candidateText, segmentText) {
  const candidate = conceptTokens(candidateText);
  const segment = conceptTokens(segmentText);

  if (candidate.length === 0 || segment.length === 0) {
    return false;
  }

  if (
    hasStakeholderRelationship(candidate, segment) ||
    hasAiChangeConcept(candidate, segment)
  ) {
    return true;
  }

  const segmentSet = new Set(segment);
  const shared = candidate.filter((token) => segmentSet.has(token));

  if (candidate.length === 1) {
    return shared.length === 1;
  }

  if (
    shared.length === 1 &&
    candidate.length <= 3 &&
    DISTINCTIVE_SINGLE_TOKENS.has(shared[0])
  ) {
    return true;
  }

  return (
    shared.length >= 3 ||
    (shared.length >= 2 && shared.length / candidate.length >= 0.5)
  );
}

export function matchesStrengthConcept(signal, segments = []) {
  const candidatePhrases = [signal.label, ...(signal.patterns ?? [])];

  return candidatePhrases.some((candidate) =>
    segments.some((segment) => conceptuallyMatches(candidate, segment)),
  );
}
