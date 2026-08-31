import assert from "node:assert/strict";
import { test } from "node:test";
import {
  approvedEvidenceLabels,
  emptyProfessionalMemory,
  extractRoleEvidence,
  extractSkillEvidence,
  mergeCvSource,
  reviewEvidence,
  suggestedRoleLabels,
} from "../src/profile/professional-memory.js";

test("skill evidence comes from the CV skills section, not employer language", () => {
  const evidence = extractSkillEvidence(`
SUMMARY
Product leader interested in a German fintech role.
SKILLS
Program management, Stakeholder management
AWS | Process improvement
EXPERIENCE
The target company requires German.
`);

  assert.deepEqual(
    evidence.map((item) => item.label),
    ["Program management", "Stakeholder management", "AWS", "Process improvement"],
  );
});

test("wrapped core capabilities and tools are reconstructed from tailored CVs", () => {
  const evidence = extractSkillEvidence(`
CORE CAPABILITIES
Growth strategy & experimentation | Product and growth
prioritisation | SQL, Excel, forecasting & dashboards | Cross-functional leadership
PROFESSIONAL EXPERIENCE
Role content is not imported as an automatic skill.
TOOLS & LANGUAGES
Tools: Jira, Confluence, Notion, GitHub
Languages: Italian (native), English (professional)
`);

  assert.deepEqual(
    evidence.map((item) => item.label),
    [
      "Growth strategy & experimentation",
      "Product and growth prioritisation",
      "SQL",
      "Excel",
      "forecasting & dashboards",
      "Cross-functional leadership",
      "Jira",
      "Confluence",
      "Notion",
      "GitHub",
    ],
  );
});

test("education headings and dates do not leak into skill evidence", () => {
  const evidence = extractSkillEvidence(`
SKILLS
Product operations | SQL | Stakeholder management
EDUCATION & CERTIFICATIONS
University of Example
2005 - 2008
2025 2026
`);

  assert.deepEqual(
    evidence.map((item) => item.label),
    ["Product operations", "SQL", "Stakeholder management"],
  );
});

test("repeated CV history produces concise role suggestions", () => {
  const firstRoles = extractRoleEvidence(
    "Head of Product Operations with program management experience.",
  );
  const secondRoles = extractRoleEvidence(
    "Product Operations leader. Previously worked in Business Operations.",
  );
  const first = mergeCvSource(
    emptyProfessionalMemory(),
    { id: "cv-one", name: "CV one.pdf" },
    [],
    firstRoles,
  );
  const second = mergeCvSource(
    first.memory,
    { id: "cv-two", name: "CV two.pdf" },
    [],
    secondRoles,
  );

  assert.deepEqual(suggestedRoleLabels(second.memory), [
    "Product Operations",
    "Business Operations",
    "Program Management",
  ]);
});

test("experience bullets contribute conservative profile signals", () => {
  const evidence = extractSkillEvidence(`
EXPERIENCE
Led quarterly strategic planning and process improvement across the business.
Owned stakeholder management and data-driven decision making.
`);

  assert.deepEqual(
    evidence.map((item) => item.label),
    [
      "Stakeholder management",
      "Process improvement",
      "Strategic planning",
      "Data-driven decision making",
    ],
  );
});

test("CV sources are deduplicated and evidence keeps provenance", () => {
  const first = mergeCvSource(
    emptyProfessionalMemory(),
    { id: "cv-one", name: "CV one.pdf" },
    [{ key: "program management", label: "Program management" }],
  );
  const duplicate = mergeCvSource(
    first.memory,
    { id: "cv-one", name: "Copy.pdf" },
    [{ key: "program management", label: "Program management" }],
  );
  const second = mergeCvSource(
    first.memory,
    { id: "cv-two", name: "CV two.pdf" },
    [{ key: "program management", label: "Program management" }],
  );

  assert.equal(duplicate.duplicate, true);
  assert.equal(duplicate.memory.sources.length, 1);
  assert.deepEqual(second.memory.evidence[0].sourceIds, ["cv-one", "cv-two"]);
});

test("an existing PDF can be rechecked when extraction rules improve", () => {
  const first = mergeCvSource(
    emptyProfessionalMemory(),
    { id: "cv-one", name: "CV one.pdf" },
    [],
  );
  const refreshed = mergeCvSource(
    first.memory,
    { id: "cv-one", name: "CV one.pdf" },
    [{ key: "jira", label: "Jira" }],
  );

  assert.equal(refreshed.duplicate, true);
  assert.equal(refreshed.memory.sources.length, 1);
  assert.equal(refreshed.addedEvidence, 1);
  assert.equal(refreshed.memory.evidence[0].label, "Jira");
});

test("rechecking the same PDF removes stale parser evidence", () => {
  const first = mergeCvSource(
    emptyProfessionalMemory(),
    { id: "same-hash", name: "CV.pdf", parserVersion: 2 },
    [
      { key: "sql", label: "SQL" },
      { key: "2005", label: "2005" },
    ],
  );
  const refreshed = mergeCvSource(
    first.memory,
    { id: "same-hash", name: "CV.pdf", parserVersion: 3 },
    [{ key: "sql", label: "SQL" }],
  );

  assert.deepEqual(
    refreshed.memory.evidence.map((item) => item.label),
    ["SQL"],
  );
});

test("a modified file replaces stale evidence from the same folder path", () => {
  const first = mergeCvSource(
    emptyProfessionalMemory(),
    { id: "old-hash", name: "CV.pdf", relativePath: "current/CV.pdf" },
    [{ key: "old skill", label: "Old skill" }],
  );
  const updated = mergeCvSource(
    first.memory,
    { id: "new-hash", name: "CV.pdf", relativePath: "current/CV.pdf" },
    [{ key: "new skill", label: "New skill" }],
  );

  assert.deepEqual(
    updated.memory.sources.map((source) => source.id),
    ["new-hash"],
  );
  assert.deepEqual(
    updated.memory.evidence.map((item) => item.label),
    ["New skill"],
  );
});

test("imported evidence is active automatically unless explicitly rejected", () => {
  const imported = mergeCvSource(
    emptyProfessionalMemory(),
    { id: "cv-one", name: "CV one.pdf" },
    [
      { key: "program management", label: "Program management" },
      { key: "sql", label: "SQL" },
    ],
  ).memory;
  const reviewed = reviewEvidence(imported, ["sql"], "rejected");

  assert.deepEqual(approvedEvidenceLabels(reviewed), ["Program management"]);
});
