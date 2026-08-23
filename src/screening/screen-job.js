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
    .replace(/[’']/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9+#]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function prepareJobPage(jobPage = {}) {
  const title = normalize(jobPage.title);
  const location = normalize(jobPage.location);
  const text = normalize(jobPage.text);

  return {
    title,
    location,
    text,
    all: [title, location, text].filter(Boolean).join(" "),
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
  const strongRule = findRule(job.title, profile.roleFit.strong);

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
    ["Role/function fit could not be classified from the job title."],
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
      ["Director-level fit depends on the role's actual scope and expectations."],
    );
  }

  if (potentialLevel) {
    return result(10, [match(`Potential seniority: ${potentialLevel}`, 10)]);
  }

  return result(
    7,
    [],
    ["Seniority could not be confirmed from the job title."],
  );
}

function evaluateLocation(job, profile) {
  const maximum = profile.scoring.categoryMaximums.location;
  const locationContext = job.location || job.text;
  const hasBerlinLocation = includesAny(locationContext, ["berlin"]);
  const hasGermanyLocation =
    hasBerlinLocation || includesAny(locationContext, ["germany", "deutschland"]);
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
      ["A mandatory onsite or relocation condition is present, but its location could not be confirmed."],
    );
  }

  if (preferredRule) {
    return result(maximum, [match(`Preferred location fit: ${preferredRule.label}`, maximum)]);
  }

  if (potentialRule) {
    return result(14, [match(`Potential location fit: ${potentialRule.label}`, 14)]);
  }

  if (!hasLocationEvidence) {
    return result(8, [], ["Location or working model could not be confirmed."]);
  }

  return result(
    0,
    [],
    ["Location does not match a preferred or potential location rule."],
  );
}

function hasLanguageRequirement(text, language) {
  const value = normalize(language);
  const patterns = [
    `${value} required`,
    `${value} is required`,
    `must speak ${value}`,
    `fluency in ${value}`,
    `fluent ${value}`,
  ];

  return includesAny(text, patterns);
}

function evaluateLanguage(job, profile) {
  const maximum = profile.scoring.categoryMaximums.language;

  if (includesAny(job.all, profile.languages.germanReviewBlockerPatterns)) {
    return result(
      0,
      [],
      [],
      [
        blocker(
          REVIEW_BLOCKER,
          "The role explicitly requires native-level or C2 German; that proficiency level is not verified.",
        ),
      ],
    );
  }

  if (includesAny(job.all, profile.languages.germanLevelReviewPatterns)) {
    return result(
      5,
      [match("German is a verified language", 5)],
      ["The required German proficiency level must be reviewed; no level is assumed."],
    );
  }

  const unsupportedRequirement = profile.languages.otherRecognizedLanguages.find(
    (language) => hasLanguageRequirement(job.all, language),
  );

  if (unsupportedRequirement) {
    return result(
      0,
      [],
      [`A mandatory ${unsupportedRequirement} requirement is not covered by the verified language list.`],
    );
  }

  const verifiedRequirement = profile.languages.verified.find((language) =>
    hasLanguageRequirement(job.all, language),
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
  const matchedSignals = profile.strengthSignals
    .filter((signal) => includesAny(job.all, signal.patterns))
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
      ["No verified strength signals were found in the posting."],
    );
  }

  return result(score, matchedSignals);
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
  const keyGaps = uniqueBy(
    Object.values(categories).flatMap((category) => category.gaps),
    (item) => item,
  );
  const blockers = uniqueBy(
    Object.values(categories).flatMap((category) => category.blockers),
    (item) => `${item.type}:${item.reason}`,
  );
  const verdict = chooseVerdict(
    score,
    blockers,
    candidateProfile.scoring.thresholds,
  );

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

