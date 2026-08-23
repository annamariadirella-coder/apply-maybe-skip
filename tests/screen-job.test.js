import assert from "node:assert/strict";
import { test } from "node:test";
import { candidateProfile } from "../src/profile/candidate-profile.js";
import { screenJob, VERDICTS } from "../src/screening/screen-job.js";

const strengthText = [
  "product operations",
  "process improvement",
  "stakeholder management",
  "cross functional collaboration",
  "program management",
  "data driven decision making",
].join(". ");

test("strong Apply: preferred role, seniority, Berlin, verified language, and strengths", () => {
  const result = screenJob(
    {
      title: "Senior Product Operations",
      location: "Berlin",
      text: `${strengthText}. English is required.`,
    },
    candidateProfile,
  );

  assert.equal(result.verdict, VERDICTS.APPLY);
  assert.equal(result.score, 100);
  assert.match(result.explanation, /^Apply /);
  assert.equal(result.blockers.length, 0);
  assert.equal(result.scoreBreakdown.roleFunction.score, 35);
  assert.equal(result.scoreBreakdown.location.score, 20);
});

test("hybrid/partial-fit Maybe: potential role and hybrid Germany", () => {
  const result = screenJob(
    {
      title: "Product Manager",
      location: "",
      text: "The role includes operations and process improvement. germany hybrid.",
    },
    candidateProfile,
  );

  assert.equal(result.verdict, VERDICTS.MAYBE);
  assert.equal(result.score, 59);
  assert.match(result.explanation, /^Maybe /);
  assert.equal(result.scoreBreakdown.roleFunction.score, 24);
  assert.equal(result.scoreBreakdown.location.score, 14);
  assert.ok(
    result.strongestMatches.includes(
      "Potential location fit: Hybrid in Germany",
    ),
  );
});

test("wrong-function Skip: software engineering title is a hard blocker", () => {
  const result = screenJob(
    {
      title: "Senior Software Engineer",
      location: "Berlin",
      text: `${strengthText}. English is required.`,
    },
    candidateProfile,
  );

  assert.equal(result.verdict, VERDICTS.SKIP);
  assert.match(result.explanation, /^Skip because /);
  assert.ok(
    result.blockers.some((item) =>
      item.reason.includes("usually-skip function: Pure Software Engineering"),
    ),
  );
});

test("mandatory C2 German: otherwise-Apply result becomes Skip", () => {
  const result = screenJob(
    {
      title: "Senior Product Operations",
      location: "Berlin",
      text: `${strengthText}. C2 German required.`,
    },
    candidateProfile,
  );

  assert.equal(result.verdict, VERDICTS.SKIP);
  assert.equal(result.score, 90);
  assert.match(result.explanation, /^Skip because /);
  assert.ok(result.blockers.some((item) => item.type === "hard"));
  assert.ok(result.explanation.includes("not part of the candidate's language profile"));
});

test("mandatory C2 German: low score is also Skip", () => {
  const result = screenJob(
    {
      title: "Office Coordinator",
      text: "C2 German required. Calendar support and office administration.",
    },
    candidateProfile,
  );

  assert.equal(result.verdict, VERDICTS.SKIP);
  assert.equal(result.score, 25);
  assert.match(result.explanation, /^Skip because /);
  assert.doesNotMatch(result.explanation, /^Maybe /);
  assert.ok(result.explanation.includes("requires German"));
});

test("optional German does not create a blocker", () => {
  const result = screenJob(
    {
      title: "Senior Product Operations",
      location: "Berlin",
      text: `${strengthText}. English is required. German is a plus.`,
    },
    candidateProfile,
  );

  assert.equal(result.verdict, VERDICTS.APPLY);
  assert.equal(result.blockers.length, 0);
});

test("missing location: empty field and no location signals in the text", () => {
  const result = screenJob(
    {
      title: "Senior Product Operations",
      text: `${strengthText}. English is required.`,
    },
    candidateProfile,
  );

  assert.equal(result.verdict, VERDICTS.APPLY);
  assert.equal(result.score, 88);
  assert.equal(result.scoreBreakdown.location.score, 8);
  assert.ok(
    result.keyGaps.includes("Location or working model could not be confirmed."),
  );
});

test("Berlin + hybrid together: preferred Berlin wins and is not double-counted", () => {
  const result = screenJob(
    {
      title: "Senior Product Operations",
      text: `Hybrid Berlin. English is required. ${strengthText}`,
    },
    candidateProfile,
  );

  assert.equal(result.verdict, VERDICTS.APPLY);
  assert.equal(result.score, 100);
  assert.equal(result.scoreBreakdown.location.score, 20);
  assert.ok(result.strongestMatches.includes("Preferred location fit: Berlin"));
  assert.equal(
    result.strongestMatches.some((item) => item.includes("Hybrid")),
    false,
  );
});
