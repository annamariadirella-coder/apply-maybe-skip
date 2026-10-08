import assert from "node:assert/strict";
import { test } from "node:test";
import {
  careerIntelligenceSummary,
  detectCareerDocumentType,
  emptyCareerIntelligence,
  extractCareerDocument,
  mergeCareerDocument,
} from "../src/profile/career-intelligence.js";
import { extractDocxXmlText } from "../src/profile/docx-text.js";

test("career evidence banks preserve confirmation status and boundaries", () => {
  const text = `
Career Evidence Bank
People Leadership
✓ Confirmed - Led an international organisation across five teams.
? Needs confirmation - Formal risk management framework ownership.
✗ Do not claim - Software engineering or data engineering ownership.
`;
  const parsed = extractCareerDocument(text, "Career Evidence Bank.pdf");

  assert.equal(detectCareerDocumentType(text), "evidence-bank");
  assert.deepEqual(
    parsed.evidence.map((item) => [item.status, item.section, item.label]),
    [
      ["confirmed", "People Leadership", "Led an international organisation across five teams."],
      ["question", "People Leadership", "Formal risk management framework ownership."],
      ["boundary", "People Leadership", "Software engineering or data engineering ownership."],
    ],
  );
});

test("positioning charters provide primary, adjacent, and excluded directions", () => {
  const parsed = extractCareerDocument(
    `
Positioning & Targeting Charter
Primary Career Lanes
Primary targets:
Head of Product Operations
Strategy & Operations Lead
Strongest evidence:
Operational redesign
3. Adjacent Roles
Growth Operations
Partnerships
4. Roles Not Targeted by Default
Normally SKIP:
Software Engineer
Enterprise Sales
Also avoid roles that require unsupported production skills.
5. Search Parameters
`,
    "Positioning Charter.docx",
  );

  assert.deepEqual(
    parsed.directions.primary.map((item) => item.label),
    ["Head of Product Operations", "Strategy & Operations Lead"],
  );
  assert.deepEqual(
    parsed.directions.adjacent.map((item) => item.label),
    ["Growth Operations", "Partnerships"],
  );
  assert.deepEqual(
    parsed.directions.excluded.map((item) => item.label),
    ["Software Engineer", "Enterprise Sales"],
  );
});

test("one plain-language career profile can contain evidence and directions", () => {
  const text = `
# Career Profile
## Career Evidence Bank
### Delivery
Confirmed - Led cross-functional delivery programmes.
Needs confirmation - Formal portfolio ownership.
Do not claim - Engineering delivery ownership.
## Positioning and Targeting Charter
## Primary Career Lanes
Primary targets:
Product Operations Lead
Strongest evidence:
Delivery systems
## 3. Adjacent Roles
Business Operations Lead
## 4. Roles Not Targeted by Default
Normally SKIP:
Software Engineer
Also avoid unsupported roles.
`;
  const parsed = extractCareerDocument(text, "career-profile.md");

  assert.equal(parsed.type, "career-profile");
  assert.equal(parsed.evidence.length, 3);
  assert.deepEqual(
    parsed.directions.primary.map((item) => item.label),
    ["Product Operations Lead"],
  );
  assert.deepEqual(
    parsed.directions.adjacent.map((item) => item.label),
    ["Business Operations Lead"],
  );
  assert.deepEqual(
    parsed.directions.excluded.map((item) => item.label),
    ["Software Engineer"],
  );
});

test("career documents can be refreshed without duplicating private sources", () => {
  const first = extractCareerDocument(
    "Career Evidence Bank\n✓ Confirmed - Process redesign.",
    "Evidence.pdf",
  );
  const second = extractCareerDocument(
    "Career Evidence Bank\n✓ Confirmed - Workflow automation.",
    "Evidence.pdf",
  );
  const imported = mergeCareerDocument(
    emptyCareerIntelligence(),
    { id: "old", name: "Evidence.pdf", relativePath: "Evidence.pdf" },
    first,
  );
  const refreshed = mergeCareerDocument(
    imported,
    { id: "new", name: "Evidence.pdf", relativePath: "Evidence.pdf" },
    second,
  );

  assert.equal(refreshed.sources.length, 1);
  assert.deepEqual(
    refreshed.evidence.map((item) => item.label),
    ["Workflow automation."],
  );
  assert.deepEqual(careerIntelligenceSummary(refreshed), {
    sources: 1,
    confirmed: 1,
    questions: 0,
    boundaries: 0,
    primaryRoles: 0,
  });
});

test("DOCX XML is converted to readable paragraph text", () => {
  const text = extractDocxXmlText(
    '<w:document><w:body><w:p><w:r><w:t>Career &amp; Evidence</w:t></w:r></w:p><w:p><w:r><w:t>Confirmed fact</w:t></w:r></w:p></w:body></w:document>',
  );

  assert.equal(text, "Career & Evidence\nConfirmed fact");
});
