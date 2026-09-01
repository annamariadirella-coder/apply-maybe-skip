import {
  conceptTokens,
  matchesStrengthConcept,
} from "./concept-match.js";

/**
 * Deterministic screening engine.
 *
 * The model scores five independent categories. Phrase repetition never adds
 * points: role and context rules classify once, while each strength group can
 * match at most once. Blockers are evaluated separately from the weighted fit
 * score so an otherwise high score cannot hide a critical conflict.
 */

export const VERDICTS = Object.freeze({
  APPLY: "Apply",
  MAYBE: "Maybe",
  SKIP: "Skip",
});

const HARD_BLOCKER = "hard";
const REVIEW_BLOCKER = "review";

function normalize(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .replace(/[’']/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9+#]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const REQUIRED_LANGUAGE_CUES = [
  "must",
  "required",
  "requirement",
  "requires",
  "mandatory",
  "essential",
  "necessary",
  "prerequisite",
  "need",
  "needs",
  "needed",
  "minimum",
  "at least",
  "expected",
  "erforderlich",
  "zwingend",
  "voraussetzung",
  "notwendig",
  "muss",
  "musst",
];

const OPTIONAL_LANGUAGE_CUES = [
  "not required",
  "not mandatory",
  "not necessary",
  "no requirement",
  "do not need",
  "dont need",
  "plus",
  "preferred",
  "preference",
  "desirable",
  "nice to have",
  "advantage",
  "advantageous",
  "beneficial",
  "optional",
  "ideally",
  "bonus",
  "would be great",
  "nicht erforderlich",
  "keine voraussetzung",
  "wunschenswert",
  "von vorteil",
  "idealerweise",
];

const PROFICIENCY_LANGUAGE_CUES = [
  "fluent",
  "fluency",
  "proficient",
  "proficiency",
  "native",
  "business level",
  "professional level",
  "working proficiency",
  "excellent command",
  "good command",
  "advanced",
  "b2",
  "c1",
  "c2",
  "verhandlungssicher",
  "fliessend",
  "sehr gute kenntnisse",
  "gute kenntnisse",
];

const NON_LANGUAGE_GERMAN_DESCRIPTORS = [
  "market",
  "markets",
  "customer",
  "customers",
  "client",
  "clients",
  "audience",
  "users",
  "company",
  "office",
  "entity",
  "team",
  "law",
  "laws",
  "regulation",
  "regulations",
  "business",
  "operations",
  "grant",
  "grants",
  "funding",
  "research",
  "tax",
  "forschungszulage",
];

function buildRequirementContexts(values) {
  return values
    .flatMap((value) =>
      String(value ?? "").split(/(?:\r?\n+|[.!?;•●▪◦]+)/u),
    )
    .map((sentence) => ({
      rawText: String(sentence).replace(/\s+/g, " ").trim(),
      text: normalize(sentence),
      clauses: String(sentence)
        .split(/(?:,|\bbut\b|\bwhereas\b|\bwhile\b|\bhowever\b)/i)
        .map(normalize)
        .filter(Boolean),
    }))
    .filter((context) => context.text);
}

function prepareJobPage(jobPage = {}) {
  const title = normalize(jobPage.title);
  const location = normalize(jobPage.location);
  const text = normalize(jobPage.text);

  return {
    rawTitle: String(jobPage.title ?? "").trim(),
    title,
    location,
    text,
    all: [title, location, text].filter(Boolean).join(" "),
    requirementContexts: buildRequirementContexts([
      jobPage.title,
      jobPage.location,
      jobPage.text,
    ]),
  };
}

function includesAny(text, patterns = []) {
  const paddedText = ` ${text} `;

  return patterns.some((pattern) =>
    paddedText.includes(` ${normalize(pattern)} `),
  );
}

function findRule(text, rules = []) {
  return rules.find((rule) => includesAny(text, rule.titlePatterns));
}

const ROLE_LEVEL_TOKENS = new Set([
  "associate",
  "chief",
  "director",
  "head",
  "lead",
  "manage",
  "manager",
  "officer",
  "senior",
  "vp",
]);

function roleFunctionTokens(value) {
  return conceptTokens(value).filter((token) => !ROLE_LEVEL_TOKENS.has(token));
}

function roleDirectionMatches(title, rule) {
  return [rule.label, ...(rule.titlePatterns ?? [])].some((direction) => {
    const directionTokens = roleFunctionTokens(direction);
    const titleTokens = new Set(roleFunctionTokens(title));

    return (
      directionTokens.length > 0 &&
      directionTokens.every((token) => titleTokens.has(token))
    );
  });
}

function result(score, matches = [], gaps = [], blockers = []) {
  return { score, matches, gaps, blockers };
}

function match(label, points) {
  return { label, points };
}

function blocker(type, reason) {
  return { type, reason };
}

function evaluateRole(job, profile) {
  const maximum = profile.scoring.categoryMaximums.roleFunction;
  const strongRule =
    findRule(job.title, profile.roleFit.strong) ??
    profile.roleFit.strong.find((rule) =>
      roleDirectionMatches(job.title, rule),
    );

  if (strongRule) {
    return result(maximum, [match(`Strong role fit: ${strongRule.label}`, maximum)]);
  }

  const potentialRule = profile.roleFit.potential.find((rule) => {
    const titleMatches = includesAny(job.title, rule.titlePatterns);
    const contextMatches =
      !rule.contextPatterns || includesAny(job.all, rule.contextPatterns);

    return titleMatches && contextMatches;
  });

  if (potentialRule) {
    return result(24, [match(`Potential role fit: ${potentialRule.label}`, 24)]);
  }

  const skipRule = findRule(job.title, profile.roleFit.usuallySkip);

  if (skipRule) {
    return result(
      0,
      [],
      [],
      [blocker(HARD_BLOCKER, `Role is in a usually-skip function: ${skipRule.label}.`)],
    );
  }

  const technicalTitle = includesAny(job.title, [
    "engineer",
    "developer",
    "technical specialist",
    "technical individual contributor",
  ]);
  const deepCodingRequired = includesAny(
    job.all,
    profile.roleFit.deepCodingRequirementPatterns,
  );

  if (technicalTitle && deepCodingRequired) {
    return result(
      0,
      [],
      [],
      [
        blocker(
          HARD_BLOCKER,
          "Role is a highly technical individual-contributor position with an explicit deep-coding requirement.",
        ),
      ],
    );
  }

  return result(
    10,
    [],
    [
      `“${job.rawTitle || "This job title"}” is not in your saved target directions. Decide whether this role belongs in your search.`,
    ],
  );
}

function evaluateSeniority(job, profile) {
  const maximum = profile.scoring.categoryMaximums.seniority;
  const skipLevel = profile.seniority.usuallySkip.find((level) =>
    includesAny(job.title, [level]),
  );

  if (skipLevel) {
    return result(
      0,
      [],
      [],
      [blocker(HARD_BLOCKER, `Seniority is usually skipped: ${skipLevel}.`)],
    );
  }

  const preferredLevel = profile.seniority.preferred.find((level) =>
    includesAny(job.title, [level]),
  );

  if (preferredLevel) {
    return result(maximum, [match(`Preferred seniority: ${preferredLevel}`, maximum)]);
  }

  const potentialLevel = profile.seniority.potential.find((level) =>
    includesAny(job.title, [level]),
  );

  if (potentialLevel === "director") {
    return result(
      10,
      [match("Potential seniority: director", 10)],
      ["Confirm whether the director-level scope matches the seniority you want."],
    );
  }

  if (potentialLevel) {
    return result(10, [match(`Potential seniority: ${potentialLevel}`, 10)]);
  }

  return result(7);
}

function evaluateLocation(job, profile) {
  const maximum = profile.scoring.categoryMaximums.location;
  const locationContext = job.location || job.text;
  const hasBerlinLocation = includesAny(locationContext, ["berlin"]);
  const hasGermanyLocation =
    hasBerlinLocation || includesAny(locationContext, ["germany", "deutschland"]);
  const hasRemoteLocation = includesAny(locationContext, [
    "remote",
    "remotely",
    "telecommute",
    "work from home",
    "home office",
  ]);
  const preferredRule = profile.location.preferred.find((rule) =>
    includesAny(job.all, rule.patterns),
  );
  const potentialRule = profile.location.potential.find((rule) =>
    includesAny(job.all, rule.patterns),
  );
  const hasLocationEvidence =
    Boolean(job.location) ||
    hasBerlinLocation ||
    hasGermanyLocation ||
    hasRemoteLocation ||
    Boolean(preferredRule) ||
    Boolean(potentialRule);
  const relocationRequired = includesAny(
    job.all,
    profile.location.relocationRequiredPatterns,
  );
  const onsiteRequired = includesAny(job.all, profile.location.onsiteRequiredPatterns);

  if (relocationRequired && hasLocationEvidence && !hasGermanyLocation) {
    return result(
      0,
      [],
      [],
      [blocker(HARD_BLOCKER, "The role requires relocation outside Germany.")],
    );
  }

  if (onsiteRequired && hasLocationEvidence && !hasBerlinLocation) {
    return result(
      0,
      [],
      [],
      [blocker(HARD_BLOCKER, "The role requires onsite work outside Berlin.")],
    );
  }

  if ((relocationRequired || onsiteRequired) && !hasLocationEvidence) {
    return result(
      5,
      [],
      ["The posting requires onsite work or relocation but does not clearly state where. Confirm the location."],
    );
  }

  if (preferredRule) {
    return result(maximum, [match(`Preferred location fit: ${preferredRule.label}`, maximum)]);
  }

  if (potentialRule) {
    return result(14, [match(`Potential location fit: ${potentialRule.label}`, 14)]);
  }

  if (hasRemoteLocation && !hasBerlinLocation && !hasGermanyLocation) {
    return result(
      8,
      [],
      ["The posting says remote but does not confirm where you may work from. Check the eligible countries."],
    );
  }

  if (!hasLocationEvidence) {
    return result(
      8,
      [],
      ["The posting does not state a clear location or working model. Confirm where the role can be performed."],
    );
  }

  return result(
    0,
    [],
    ["The listed location is outside your saved preferences. Decide whether you would still consider it."],
  );
}

function languageLabel(language) {
  return typeof language === "string" ? language : language.label;
}

function languageAliases(language) {
  const aliases =
    typeof language === "string"
      ? [language]
      : [language.label, ...(language.aliases ?? [])];

  return [...new Set(aliases.map(normalize).filter(Boolean))];
}

function phraseSpans(tokens, phrases) {
  return phrases.flatMap((phrase) => {
    const phraseTokens = normalize(phrase).split(" ").filter(Boolean);
    const spans = [];

    for (let index = 0; index <= tokens.length - phraseTokens.length; index += 1) {
      const matches = phraseTokens.every(
        (token, offset) => tokens[index + offset] === token,
      );

      if (matches) {
        spans.push({ start: index, end: index + phraseTokens.length - 1 });
      }
    }

    return spans;
  });
}

function spanDistance(left, right) {
  if (left.end < right.start) {
    return right.start - left.end;
  }

  if (right.end < left.start) {
    return left.start - right.end;
  }

  return 0;
}

function nearestCueDistance(text, language, cues) {
  const tokens = normalize(text).split(" ").filter(Boolean);
  const languageSpans = phraseSpans(tokens, languageAliases(language));
  const cueSpans = phraseSpans(tokens, cues);

  if (languageSpans.length === 0 || cueSpans.length === 0) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.min(
    ...languageSpans.flatMap((languageSpan) =>
      cueSpans.map((cueSpan) => spanDistance(languageSpan, cueSpan)),
    ),
  );
}

function mentionsLanguage(text, language) {
  return includesAny(text, languageAliases(language));
}

function appearsOnlyAsNonLanguageGermanDescriptor(text, language) {
  if (normalize(languageLabel(language)) !== "german") {
    return false;
  }

  const tokens = normalize(text).split(" ").filter(Boolean);
  const germanSpans = phraseSpans(tokens, ["german"]);

  return (
    germanSpans.length > 0 &&
    germanSpans.every((span) => {
      const followingTokens = tokens.slice(span.end + 1, span.end + 7);

      return followingTokens.some((token) =>
        NON_LANGUAGE_GERMAN_DESCRIPTORS.includes(token),
      );
    })
  );
}

function classifyLanguageClause(text, language) {
  if (!mentionsLanguage(text, language)) {
    return "absent";
  }

  const requiredDistance = nearestCueDistance(
    text,
    language,
    REQUIRED_LANGUAGE_CUES,
  );
  const optionalDistance = nearestCueDistance(
    text,
    language,
    OPTIONAL_LANGUAGE_CUES,
  );
  const proficiencyDistance = nearestCueDistance(
    text,
    language,
    PROFICIENCY_LANGUAGE_CUES,
  );

  if (
    !Number.isFinite(proficiencyDistance) &&
    appearsOnlyAsNonLanguageGermanDescriptor(text, language)
  ) {
    return "mentioned";
  }

  if (
    Number.isFinite(optionalDistance) &&
    optionalDistance <= requiredDistance
  ) {
    return "optional";
  }

  if (Number.isFinite(requiredDistance)) {
    return "required";
  }

  if (Number.isFinite(optionalDistance)) {
    return "optional";
  }

  if (proficiencyDistance <= 5) {
    return "required";
  }

  return "mentioned";
}

function classifyLanguageContext(context, language) {
  const clauseStatuses = context.clauses
    .filter((clause) => mentionsLanguage(clause, language))
    .map((clause) => classifyLanguageClause(clause, language));

  if (clauseStatuses.includes("required")) {
    return "required";
  }

  if (clauseStatuses.includes("optional")) {
    return "optional";
  }

  return classifyLanguageClause(context.text, language);
}

function hasVerifiedAlternative(text, language, verifiedLanguages) {
  const tokens = normalize(text).split(" ").filter(Boolean);
  const languageSpans = phraseSpans(tokens, languageAliases(language));
  const alternativeSpans = verifiedLanguages.flatMap((verifiedLanguage) =>
    phraseSpans(tokens, languageAliases(verifiedLanguage)),
  );
  const orIndexes = tokens
    .map((token, index) => (token === "or" ? index : -1))
    .filter((index) => index >= 0);

  return languageSpans.some((languageSpan) =>
    alternativeSpans.some((alternativeSpan) =>
      orIndexes.some((orIndex) => {
        const languageBeforeAlternative =
          languageSpan.end < orIndex && orIndex < alternativeSpan.start;
        const alternativeBeforeLanguage =
          alternativeSpan.end < orIndex && orIndex < languageSpan.start;

        if (!languageBeforeAlternative && !alternativeBeforeLanguage) {
          return false;
        }

        return (
          Math.min(
            Math.abs(orIndex - languageSpan.end),
            Math.abs(orIndex - languageSpan.start),
          ) <= 5 &&
          Math.min(
            Math.abs(alternativeSpan.start - orIndex),
            Math.abs(alternativeSpan.end - orIndex),
          ) <= 5
        );
      }),
    ),
  );
}

function hasLanguageRequirement(job, language, verifiedAlternatives = []) {
  return job.requirementContexts.some((context) => {
    if (classifyLanguageContext(context, language) !== "required") {
      return false;
    }

    return !hasVerifiedAlternative(context.text, language, verifiedAlternatives);
  });
}

function evaluateLanguage(job, profile) {
  const maximum = profile.scoring.categoryMaximums.language;
  const unavailableRequirement = profile.languages.unavailable.find((language) =>
    hasLanguageRequirement(job, language, profile.languages.verified),
  );

  if (unavailableRequirement) {
    return result(
      0,
      [],
      [],
      [
        blocker(
          HARD_BLOCKER,
          `The role requires ${languageLabel(unavailableRequirement)}, which is not part of the candidate's language profile.`,
        ),
      ],
    );
  }

  const unsupportedRequirement = profile.languages.otherRecognizedLanguages.find(
    (language) => hasLanguageRequirement(job, language, profile.languages.verified),
  );

  if (unsupportedRequirement) {
    return result(
      0,
      [],
      [`The posting requires ${unsupportedRequirement}, but your profile does not say whether you speak it.`],
    );
  }

  const verifiedRequirement = profile.languages.verified.find((language) =>
    hasLanguageRequirement(job, language),
  );

  if (verifiedRequirement) {
    return result(
      maximum,
      [
        match(
          `Required language is verified: ${verifiedRequirement} (proficiency level not assumed)`,
          maximum,
        ),
      ],
    );
  }

  return result(8, [], []);
}

function evaluateStrengths(job, profile) {
  const maximum = profile.scoring.categoryMaximums.relevantStrengths;
  const segments = job.requirementContexts.map((context) => context.text);
  const matchedSignals = profile.strengthSignals
    .filter(
      (signal) =>
        includesAny(job.all, signal.patterns) ||
        matchesStrengthConcept(signal, segments),
    )
    .map((signal) => match(signal.label, signal.weight))
    .sort((left, right) => right.points - left.points);
  const score = Math.min(
    maximum,
    matchedSignals.reduce((total, signal) => total + signal.points, 0),
  );

  if (matchedSignals.length === 0) {
    return result(
      0,
      [],
      ["The responsibilities do not clearly overlap with the experience signals in your CV memory. Review the role manually."],
    );
  }

  return result(score, matchedSignals);
}

const REQUIREMENT_CUES = [
  "must",
  "required",
  "requirement",
  "strong experience",
  "significant experience",
  "demonstrated track record",
  "proven track record",
  "hands on experience",
  "ability to",
];

const REQUIREMENT_NOISE_TOKENS = new Set([
  "ability",
  "candidate",
  "demonstrate",
  "experience",
  "field",
  "have",
  "is",
  "level",
  "must",
  "proven",
  "related",
  "requirement",
  "required",
  "role",
  "significant",
  "strong",
  "track",
]);

const GENERIC_REQUIREMENT_TOKENS = new Set([
  "business",
  "develop",
  "lead",
  "manage",
  "operate",
  "service",
  "skill",
  "team",
  "use",
  "work",
]);

function profileEvidencePhrases(profile) {
  return profile.strengthSignals.flatMap((signal) => [
    signal.label,
    ...(signal.patterns ?? []),
  ]);
}

function requirementMentionsLanguage(context, profile) {
  const languages = [
    ...profile.languages.verified,
    ...profile.languages.unavailable.flatMap(languageAliases),
    ...profile.languages.otherRecognizedLanguages,
  ];

  return includesAny(context.text, languages);
}

function requirementRiskScore(context, evidencePhrases) {
  const evidenceTokens = new Set(evidencePhrases.flatMap(conceptTokens));
  const requirementTokens = conceptTokens(context.text).filter(
    (token) => !REQUIREMENT_NOISE_TOKENS.has(token),
  );
  const distinctiveTokens = requirementTokens.filter(
    (token) => !GENERIC_REQUIREMENT_TOKENS.has(token),
  );
  const coverageTokens =
    distinctiveTokens.length > 0 ? distinctiveTokens : requirementTokens;
  const coveredTokens = coverageTokens.filter((token) =>
    evidenceTokens.has(token),
  );
  const sufficientlyCovered =
    coverageTokens.length === 1
      ? coveredTokens.length === 1
      : coveredTokens.length >= 2 &&
        coveredTokens.length / coverageTokens.length >= 0.5;

  if (
    context.rawText.length < 35 ||
    context.rawText.length > 260 ||
    !includesAny(context.text, REQUIREMENT_CUES) ||
    sufficientlyCovered
  ) {
    return Number.NEGATIVE_INFINITY;
  }

  const unmatched = requirementTokens.filter(
    (token) => !evidenceTokens.has(token),
  );
  const unmatchedRatio = unmatched.length / Math.max(requirementTokens.length, 1);
  const multiLocationWeight = includesAny(context.text, [
    "multi location",
    "multiple locations",
    "distributed network",
  ])
    ? 5
    : 0;
  const alternativesWeight = Math.min(
    (context.rawText.match(/,|\bor\b/gi) ?? []).length,
    4,
  );

  return unmatchedRatio * 10 + multiLocationWeight + alternativesWeight;
}

function shortenRequirement(value, maximum = 190) {
  return value.length <= maximum
    ? value
    : `${value.slice(0, maximum - 1).trimEnd()}…`;
}

function requirementRiskMessage(context) {
  const requirement = shortenRequirement(context.rawText);

  if (
    includesAny(context.text, [
      "multi location",
      "multiple locations",
      "distributed network",
    ])
  ) {
    return `Key experience to verify: “${requirement}” Comparable work across multiple markets, locations, or partner networks may be relevant.`;
  }

  return `Key experience to verify: “${requirement}”`;
}

function evaluateRequirementRisks(job, profile) {
  const evidencePhrases = profileEvidencePhrases(profile);

  return job.requirementContexts
    .filter((context) => !requirementMentionsLanguage(context, profile))
    .map((context) => ({
      context,
      score: requirementRiskScore(context, evidencePhrases),
    }))
    .filter((item) => Number.isFinite(item.score))
    .sort((left, right) => right.score - left.score)
    .slice(0, 2)
    .map((item) => requirementRiskMessage(item.context));
}

function uniqueBy(items, keyForItem) {
  const seen = new Set();

  return items.filter((item) => {
    const key = keyForItem(item);

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function chooseVerdict(score, blockers, thresholds) {
  if (blockers.some((item) => item.type === HARD_BLOCKER)) {
    return VERDICTS.SKIP;
  }

  const baseVerdict =
    score >= thresholds.apply
      ? VERDICTS.APPLY
      : score >= thresholds.maybe
        ? VERDICTS.MAYBE
        : VERDICTS.SKIP;

  if (
    baseVerdict === VERDICTS.APPLY &&
    blockers.some((item) => item.type === REVIEW_BLOCKER)
  ) {
    return VERDICTS.MAYBE;
  }

  return baseVerdict;
}

function buildExplanation(verdict, score, matches, gaps, blockers, thresholds) {
  const hardBlocker = blockers.find((item) => item.type === HARD_BLOCKER);
  const reviewBlocker = blockers.find((item) => item.type === REVIEW_BLOCKER);
  const leadingMatch = matches[0]?.label;
  const leadingGap = gaps[0];

  if (verdict === VERDICTS.SKIP && hardBlocker) {
    return `Skip because ${hardBlocker.reason} The weighted fit score is ${score}/100, but hard blockers override it.`;
  }

  if (verdict === VERDICTS.MAYBE && reviewBlocker) {
    return `Maybe because ${reviewBlocker.reason} The weighted fit score is ${score}/100, but this requirement needs explicit review.`;
  }

  if (verdict === VERDICTS.APPLY) {
    return `Apply with a weighted fit score of ${score}/100${leadingMatch ? `, led by ${leadingMatch.toLowerCase()}` : ""}.`;
  }

  if (verdict === VERDICTS.MAYBE) {
    return `Maybe with a weighted fit score of ${score}/100${leadingGap ? `; review: ${leadingGap}` : ""}.`;
  }

  if (reviewBlocker) {
    return `Skip with a weighted fit score of ${score}/100, below the Maybe threshold of ${thresholds.maybe}. ${reviewBlocker.reason}`;
  }

  return `Skip with a weighted fit score of ${score}/100, below the Maybe threshold of ${thresholds.maybe}${leadingGap ? `; main gap: ${leadingGap}` : ""}.`;
}

/**
 * Screen a normalized job-page object against the supplied candidate profile.
 *
 * Expected jobPage fields: title, location, text, and optionally url.
 * Location may be omitted; location rules then read signals from job text.
 * The engine is browser-independent and performs no network or storage operations.
 */
export function screenJob(jobPage, candidateProfile) {
  const job = prepareJobPage(jobPage);
  const categories = {
    roleFunction: evaluateRole(job, candidateProfile),
    seniority: evaluateSeniority(job, candidateProfile),
    location: evaluateLocation(job, candidateProfile),
    language: evaluateLanguage(job, candidateProfile),
    relevantStrengths: evaluateStrengths(job, candidateProfile),
  };
  const score = Object.values(categories).reduce(
    (total, category) => total + category.score,
    0,
  );
  const matches = uniqueBy(
    Object.values(categories).flatMap((category) => category.matches),
    (item) => item.label,
  ).sort((left, right) => right.points - left.points);
  const requirementRisks = evaluateRequirementRisks(job, candidateProfile);
  const keyGaps = uniqueBy(
    [
      ...requirementRisks,
      ...Object.values(categories).flatMap((category) => category.gaps),
    ],
    (item) => item,
  );
  const blockers = uniqueBy(
    Object.values(categories).flatMap((category) => category.blockers),
    (item) => `${item.type}:${item.reason}`,
  );
  const scoredVerdict = chooseVerdict(
    score,
    blockers,
    candidateProfile.scoring.thresholds,
  );
  const verdict =
    scoredVerdict === VERDICTS.APPLY && requirementRisks.length > 0
      ? VERDICTS.MAYBE
      : scoredVerdict;

  return {
    verdict,
    score,
    explanation: buildExplanation(
      verdict,
      score,
      matches,
      keyGaps,
      blockers,
      candidateProfile.scoring.thresholds,
    ),
    strongestMatches: matches.slice(0, 5).map((item) => item.label),
    keyGaps: keyGaps.slice(0, 5),
    blockers,
    scoreBreakdown: Object.fromEntries(
      Object.entries(categories).map(([name, category]) => [
        name,
        {
          score: category.score,
          maximum: candidateProfile.scoring.categoryMaximums[name],
        },
      ]),
    ),
  };
}
