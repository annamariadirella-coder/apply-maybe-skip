export const PROFESSIONAL_MEMORY_KEY = "professionalMemory";

const EMPTY_MEMORY = Object.freeze({
  version: 2,
  sources: [],
  evidence: [],
  roles: [],
});
const SKILL_HEADINGS = /^(?:(?:core\s+)?(?:skills|capabilities|competencies|expertise)|tools|technologies|technical skills|areas of expertise|tools\s*(?:&|and)\s*languages)$/i;
const SECTION_HEADINGS = /^(?:experience|professional experience|employment|education|languages|certifications|projects|profile|summary|achievements|interests|references)$/i;

const EXPERIENCE_SIGNAL_CATALOG = [
  ["Program management", ["program management", "programme management"]],
  ["Project management", ["project management"]],
  ["Product operations", ["product operations", "product ops"]],
  ["Business operations", ["business operations", "business ops"]],
  ["Stakeholder management", ["stakeholder management"]],
  ["Process improvement", ["process improvement", "process optimization", "process optimisation"]],
  ["Cross-functional collaboration", ["cross-functional collaboration", "cross functional collaboration"]],
  ["Cross-functional leadership", ["cross-functional leadership", "cross functional leadership"]],
  ["Strategic planning", ["strategic planning"]],
  ["Change management", ["change management"]],
  ["Data-driven decision making", ["data-driven decision making", "data driven decision making"]],
  ["Operational excellence", ["operational excellence"]],
  ["Team leadership", ["team leadership"]],
  ["Executive communication", ["executive communication", "executive communications"]],
  ["Product strategy", ["product strategy"]],
  ["Growth strategy", ["growth strategy"]],
  ["Budget management", ["budget management", "budget ownership"]],
  ["AI adoption", ["ai adoption", "artificial intelligence adoption"]],
  ["Dashboards and reporting", ["dashboards and reporting", "reporting dashboards"]],
];

const ROLE_CATALOG = [
  ["Product Operations", ["product operations", "product ops"]],
  ["Chief of Staff", ["chief of staff"]],
  ["Program Management", ["program manager", "program management", "programme manager"]],
  ["Product Management", ["product manager", "product management"]],
  ["Business Operations", ["business operations", "business ops"]],
  ["Strategy and Operations", ["strategy and operations", "strategy & operations"]],
  ["Business Transformation", ["business transformation"]],
  ["Project Management", ["project manager", "project management"]],
  ["Operations Management", ["operations manager", "operations management"]],
];

function clean(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function keyFor(value) {
  return clean(value).toLowerCase().replace(/[^a-z0-9+#]+/g, " ").trim();
}

function normalizedText(value) {
  return ` ${keyFor(value)} `;
}

function catalogEvidence(text, catalog) {
  const searchable = normalizedText(text);

  return catalog
    .filter(([, patterns]) =>
      patterns.some((pattern) => searchable.includes(` ${keyFor(pattern)} `)),
    )
    .map(([label]) => ({ key: keyFor(label), label }));
}

function looksLikeHeading(line) {
  const value = clean(line).replace(/:$/, "");
  return SKILL_HEADINGS.test(value) || SECTION_HEADINGS.test(value);
}

function candidateTerms(line) {
  return String(line)
    .replace(/^[•●▪◦*+-]+\s*/, "")
    .split(/[|,;•●▪◦·]+/)
    .map(clean)
    .filter((value) => value.length >= 2 && value.length <= 70)
    .filter((value) => !/^\d+$/.test(value));
}

export function extractSkillEvidence(text = "") {
  const lines = String(text)
    .split(/\r?\n/)
    .map(clean)
    .filter(Boolean);
  const found = [];
  let skillLines = null;

  const flushSkills = () => {
    if (!skillLines) return;
    const usableLines = skillLines
      .map((line) => line.split(/\blanguages\s*:/i)[0])
      .map((line) => line.replace(/^tools\s*:\s*/i, ""))
      .map(clean)
      .filter(Boolean);
    const combined = usableLines.reduce((result, line, index) => {
      if (index === 0) return line;
      const previous = usableLines[index - 1];
      const continuesPrevious =
        /[|,&/]\s*$/.test(previous) || /^[a-z]/.test(line);
      return `${result}${continuesPrevious ? " " : " | "}${line}`;
    }, "");
    found.push(...candidateTerms(combined));
    skillLines = null;
  };

  for (const line of lines) {
    const heading = line.replace(/:$/, "");

    if (SKILL_HEADINGS.test(heading)) {
      flushSkills();
      skillLines = [];
      const inline = line.includes(":") ? line.slice(line.indexOf(":") + 1) : "";
      if (inline) skillLines.push(inline);
      continue;
    }

    if (skillLines && looksLikeHeading(line)) {
      flushSkills();
      continue;
    }

    if (skillLines) {
      skillLines.push(line);
    }
  }

  flushSkills();

  const explicitSkills = [...new Map(found.map((label) => [keyFor(label), label])).entries()]
    .filter(([key]) => key)
    .map(([key, label]) => ({ key, label }));

  const catalogSignals = catalogEvidence(text, EXPERIENCE_SIGNAL_CATALOG).filter(
    (candidate) =>
      !explicitSkills.some((skill) => {
        const skillText = normalizedText(skill.label);
        const candidateText = normalizedText(candidate.label);
        return skillText.includes(candidateText) || candidateText.includes(skillText);
      }),
  );

  return [
    ...new Map(
      [...explicitSkills, ...catalogSignals].map((item) => [item.key, item]),
    ).values(),
  ];
}

export function extractRoleEvidence(text = "") {
  return catalogEvidence(text, ROLE_CATALOG);
}

export function emptyProfessionalMemory() {
  return { ...EMPTY_MEMORY, sources: [], evidence: [], roles: [] };
}

function currentMemory(memory) {
  if (memory?.version !== 1 && memory?.version !== 2) {
    return emptyProfessionalMemory();
  }

  return {
    version: 2,
    sources: memory.sources ?? [],
    evidence: (memory.evidence ?? []).map((item) => ({
      ...item,
      status: item.status === "rejected" ? "rejected" : "approved",
    })),
    roles: memory.roles ?? [],
  };
}

function mergeItems(currentItems, candidates, sourceId) {
  const items = new Map(currentItems.map((item) => [item.key, { ...item }]));
  let added = 0;

  candidates.forEach((candidate) => {
    const existing = items.get(candidate.key);

    if (existing) {
      items.set(candidate.key, {
        ...existing,
        sourceIds: [...new Set([...(existing.sourceIds ?? []), sourceId])],
      });
      return;
    }

    items.set(candidate.key, {
      ...candidate,
      sourceIds: [sourceId],
    });
    added += 1;
  });

  return { items: [...items.values()], added };
}

export function mergeCvSource(memory, source, candidates, roleCandidates = []) {
  const loaded = currentMemory(memory);
  const replacedSource = loaded.sources.find(
    (item) =>
      item.id !== source.id &&
      item.relativePath &&
      source.relativePath &&
      keyFor(item.relativePath) === keyFor(source.relativePath),
  );
  const withoutReplacedSource = (items) =>
    items
      .map((item) => ({
        ...item,
        sourceIds: (item.sourceIds ?? []).filter(
          (sourceId) => sourceId !== replacedSource?.id,
        ),
      }))
      .filter((item) => item.sourceIds.length > 0);
  const current = replacedSource
    ? {
        ...loaded,
        sources: loaded.sources.filter((item) => item.id !== replacedSource.id),
        evidence: withoutReplacedSource(loaded.evidence),
        roles: withoutReplacedSource(loaded.roles),
      }
    : loaded;
  const duplicate = current.sources.some((item) => item.id === source.id);
  const evidence = mergeItems(current.evidence, candidates, source.id);
  const roles = mergeItems(current.roles, roleCandidates, source.id);

  return {
    duplicate,
    addedEvidence: evidence.added,
    addedRoles: roles.added,
    memory: {
      version: 2,
      sources: duplicate
        ? current.sources.map((item) =>
            item.id === source.id ? { ...item, ...source } : item,
          )
        : [...current.sources, source],
      evidence: evidence.items.map((item) => ({
        ...item,
        status: item.status ?? "approved",
      })),
      roles: roles.items,
    },
  };
}

export function reviewEvidence(memory, keys, status) {
  const selected = new Set(keys);
  return {
    ...memory,
    evidence: memory.evidence.map((item) =>
      selected.has(item.key) ? { ...item, status } : item,
    ),
  };
}

export function approvedEvidenceLabels(memory) {
  return (memory?.evidence ?? [])
    .filter((item) => item.status !== "rejected")
    .map((item) => item.label);
}

export function suggestedRoleLabels(memory, limit = 5) {
  return [...(memory?.roles ?? [])]
    .sort(
      (left, right) =>
        (right.sourceIds?.length ?? 0) - (left.sourceIds?.length ?? 0) ||
        left.label.localeCompare(right.label),
    )
    .slice(0, limit)
    .map((item) => item.label);
}
