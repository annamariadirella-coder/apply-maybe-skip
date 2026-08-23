import assert from "node:assert/strict";
import { test } from "node:test";
import {
  approvedEvidenceLabels,
  emptyProfessionalMemory,
  extractSkillEvidence,
  mergeCvSource,
  reviewEvidence,
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

test("only explicitly approved evidence enters the canonical strengths", () => {
  const imported = mergeCvSource(
    emptyProfessionalMemory(),
    { id: "cv-one", name: "CV one.pdf" },
    [
      { key: "program management", label: "Program management" },
      { key: "sql", label: "SQL" },
    ],
  ).memory;
  const reviewed = reviewEvidence(imported, ["program management"], "approved");

  assert.deepEqual(approvedEvidenceLabels(reviewed), ["Program management"]);
});
