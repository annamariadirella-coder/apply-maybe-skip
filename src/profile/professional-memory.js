export const PROFESSIONAL_MEMORY_KEY = "professionalMemory";

const EMPTY_MEMORY = Object.freeze({ version: 1, sources: [], evidence: [] });
const SKILL_HEADINGS = /^(?:core\s+)?(?:skills|competencies|expertise|tools|technologies|technical skills|areas of expertise)$/i;
const SECTION_HEADINGS = /^(?:experience|professional experience|employment|education|languages|certifications|projects|profile|summary|achievements|interests|references)$/i;

function clean(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function keyFor(value) {
  return clean(value).toLowerCase().replace(/[^a-z0-9+#]+/g, " ").trim();
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
  let inSkills = false;

  for (const line of lines) {
    const heading = line.replace(/:$/, "");

    if (SKILL_HEADINGS.test(heading)) {
      inSkills = true;
      const inline = line.includes(":") ? line.slice(line.indexOf(":") + 1) : "";
      found.push(...candidateTerms(inline));
      continue;
    }

    if (inSkills && looksLikeHeading(line)) {
      inSkills = false;
      continue;
    }

    if (inSkills) {
      found.push(...candidateTerms(line));
    }
  }

  return [...new Map(found.map((label) => [keyFor(label), label])).entries()]
    .filter(([key]) => key)
    .map(([key, label]) => ({ key, label }));
}

export function emptyProfessionalMemory() {
  return { ...EMPTY_MEMORY, sources: [], evidence: [] };
}

export function mergeCvSource(memory, source, candidates) {
  const current = memory?.version === 1 ? memory : emptyProfessionalMemory();

  if (current.sources.some((item) => item.id === source.id)) {
    return { memory: current, duplicate: true, addedEvidence: 0 };
  }

  const evidence = new Map(current.evidence.map((item) => [item.key, { ...item }]));
  let addedEvidence = 0;

  candidates.forEach((candidate) => {
    const existing = evidence.get(candidate.key);

    if (existing) {
      evidence.set(candidate.key, {
        ...existing,
        sourceIds: [...new Set([...existing.sourceIds, source.id])],
      });
      return;
    }

    evidence.set(candidate.key, {
      ...candidate,
      status: "pending",
      sourceIds: [source.id],
    });
    addedEvidence += 1;
  });

  return {
    duplicate: false,
    addedEvidence,
    memory: {
      version: 1,
      sources: [...current.sources, source],
      evidence: [...evidence.values()],
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
    .filter((item) => item.status === "approved")
    .map((item) => item.label);
}
