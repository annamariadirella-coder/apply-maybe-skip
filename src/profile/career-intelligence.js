import { extractSkillEvidence } from "./professional-memory.js";

export const CAREER_INTELLIGENCE_KEY = "careerIntelligence";

const EMPTY_INTELLIGENCE = Object.freeze({
  version: 1,
  sources: [],
  evidence: [],
  directions: {
    primary: [],
    adjacent: [],
    excluded: [],
  },
});

function clean(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function keyFor(value = "") {
  return clean(value).toLowerCase().replace(/[^a-z0-9+#]+/g, " ").trim();
}

function linesFrom(text = "") {
  return String(text)
    .split(/\r?\n/)
    .map((line) => clean(line.replace(/^(?:[•●▪◦]+|#{1,6})\s*/, "")))
    .filter(Boolean);
}

export function emptyCareerIntelligence() {
  return {
    ...EMPTY_INTELLIGENCE,
    sources: [],
    evidence: [],
    directions: { primary: [], adjacent: [], excluded: [] },
  };
}

export function detectCareerDocumentType(text = "", fileName = "") {
  const searchable = `${fileName}\n${text}`.toLowerCase();
  const hasEvidenceBank =
    searchable.includes("career evidence bank") ||
    (searchable.includes("needs confirmation") &&
      searchable.includes("do not claim"));
  const hasCharter =
    searchable.includes("positioning & targeting charter") ||
    searchable.includes("positioning and targeting charter") ||
    (searchable.includes("primary career lanes") &&
      searchable.includes("roles not targeted"));

  if (hasEvidenceBank && hasCharter) return "career-profile";
  if (hasEvidenceBank) return "evidence-bank";

  if (hasCharter) return "positioning-charter";

  if (searchable.includes("master cv")) return "master-cv";
  return "career-notes";
}

function statusLine(line) {
  const patterns = [
    ["confirmed", /^(?:[✓✔]\s*)?confirmed\s*[-:–—]\s*(.+)$/i],
    ["question", /^(?:\?\s*)?needs confirmation\s*[-:–—]\s*(.+)$/i],
    ["boundary", /^(?:[✗✘]\s*)?do not claim\s*[-:–—]\s*(.+)$/i],
  ];

  for (const [status, pattern] of patterns) {
    const match = line.match(pattern);
    if (match) return { status, label: clean(match[1]) };
  }

  return undefined;
}

function likelyHeading(line) {
  return (
    line.length <= 80 &&
    !/[.!?]$/.test(line) &&
    !statusLine(line) &&
    !/^(?:version|purpose|priority|company):/i.test(line)
  );
}

function evidenceFromBank(text) {
  const lines = linesFrom(text);
  let section = "Career evidence";
  const evidence = [];

  lines.forEach((line, index) => {
    const parsed = statusLine(line);

    if (parsed) {
      evidence.push({
        key: keyFor(parsed.label),
        label: parsed.label,
        status: parsed.status,
        section,
      });
      return;
    }

    if (likelyHeading(line) && statusLine(lines[index + 1] ?? "")) {
      section = line;
    }
  });

  return evidence;
}

function valuesAfter(lines, startIndex, stopPattern) {
  const values = [];

  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (stopPattern.test(line)) break;
    if (
      line.length <= 100 &&
      !/[.!?]$/.test(line) &&
      !/:$/.test(line) &&
      !/^(?:priority|primary target)$/i.test(line)
    ) {
      values.push(line);
    }
  }

  return values;
}

function uniqueDirections(values) {
  return [
    ...new Map(
      values
        .map(clean)
        .filter(Boolean)
        .map((label) => [keyFor(label), { key: keyFor(label), label }]),
    ).values(),
  ];
}

function directionsFromCharter(text) {
  const lines = linesFrom(text);
  const primary = [];
  const adjacent = [];
  const excluded = [];

  lines.forEach((line, index) => {
    if (/^primary targets:?$/i.test(line)) {
      primary.push(
        ...valuesAfter(lines, index, /^strongest evidence:?$/i),
      );
    }

    if (/^3\.?\s+adjacent roles$/i.test(line)) {
      adjacent.push(
        ...valuesAfter(
          lines,
          index,
          /^(?:annamaria\b|4\.?\s+roles not targeted)/i,
        ),
      );
    }

    if (/^normally skip:?$/i.test(line)) {
      excluded.push(
        ...valuesAfter(
          lines,
          index,
          /^(?:also avoid\b|5\.?\s+search parameters)/i,
        ),
      );
    }
  });

  return {
    primary: uniqueDirections(primary),
    adjacent: uniqueDirections(adjacent),
    excluded: uniqueDirections(excluded),
  };
}

function masterCvEvidence(text) {
  return extractSkillEvidence(text).map((item) => ({
    ...item,
    status: "confirmed",
    section: "Master CV",
  }));
}

export function extractCareerDocument(text = "", fileName = "") {
  const type = detectCareerDocumentType(text, fileName);

  if (type === "career-profile") {
    return {
      type,
      evidence: evidenceFromBank(text),
      directions: directionsFromCharter(text),
    };
  }

  if (type === "evidence-bank") {
    return {
      type,
      evidence: evidenceFromBank(text),
      directions: { primary: [], adjacent: [], excluded: [] },
    };
  }

  if (type === "positioning-charter") {
    return {
      type,
      evidence: [],
      directions: directionsFromCharter(text),
    };
  }

  if (type === "master-cv") {
    return {
      type,
      evidence: masterCvEvidence(text),
      directions: { primary: [], adjacent: [], excluded: [] },
    };
  }

  return {
    type,
    evidence: evidenceFromBank(text),
    directions: { primary: [], adjacent: [], excluded: [] },
  };
}

function currentIntelligence(value) {
  if (value?.version !== 1) return emptyCareerIntelligence();

  return {
    version: 1,
    sources: value.sources ?? [],
    evidence: value.evidence ?? [],
    directions: {
      primary: value.directions?.primary ?? [],
      adjacent: value.directions?.adjacent ?? [],
      excluded: value.directions?.excluded ?? [],
    },
  };
}

function withoutSource(items, sourceId) {
  return items.filter((item) => item.sourceId !== sourceId);
}

export function mergeCareerDocument(intelligence, source, parsed) {
  const current = currentIntelligence(intelligence);
  const replaced = current.sources.find(
    (item) =>
      item.id !== source.id &&
      item.relativePath &&
      source.relativePath &&
      keyFor(item.relativePath) === keyFor(source.relativePath),
  );
  const removedIds = new Set([source.id, replaced?.id].filter(Boolean));
  const keep = (item) => !removedIds.has(item.sourceId);
  const sources = current.sources.filter((item) => !removedIds.has(item.id));
  const tag = (item) => ({ ...item, sourceId: source.id, sourceType: parsed.type });

  return {
    version: 1,
    sources: [...sources, { ...source, type: parsed.type }],
    evidence: [...current.evidence.filter(keep), ...parsed.evidence.map(tag)],
    directions: Object.fromEntries(
      ["primary", "adjacent", "excluded"].map((group) => [
        group,
        [
          ...current.directions[group].filter(keep),
          ...parsed.directions[group].map(tag),
        ],
      ]),
    ),
  };
}

export function careerEvidenceByStatus(intelligence, status) {
  return (intelligence?.evidence ?? []).filter((item) => item.status === status);
}

export function careerDirectionLabels(intelligence, group) {
  return (intelligence?.directions?.[group] ?? []).map((item) => item.label);
}

export function careerIntelligenceSummary(intelligence) {
  return {
    sources: intelligence?.sources?.length ?? 0,
    confirmed: careerEvidenceByStatus(intelligence, "confirmed").length,
    questions: careerEvidenceByStatus(intelligence, "question").length,
    boundaries: careerEvidenceByStatus(intelligence, "boundary").length,
    primaryRoles: intelligence?.directions?.primary?.length ?? 0,
  };
}
