import assert from "node:assert/strict";
import { test } from "node:test";
import { candidateProfile } from "../src/profile/candidate-profile.js";
import { buildCandidateProfile } from "../src/profile/profile-settings.js";
import { screenJob, VERDICTS } from "../src/screening/screen-job.js";

const strengthText = [
  "product operations",
  "process improvement",
  "stakeholder management",
  "cross functional collaboration",
  "program management",
  "data driven decision making",
].join(". ");

function screenLanguageRequirement(text) {
  return screenJob(
    {
      title: "Senior Product Operations",
      location: "Berlin",
      text: `${strengthText}. ${text}`,
    },
    candidateProfile,
  );
}

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

test("coordinated business-level German and English requirement is a hard blocker", () => {
  const result = screenLanguageRequirement(
    "Business-level proficiency in both German and English is a must.",
  );

  assert.equal(result.verdict, VERDICTS.SKIP);
  assert.equal(result.scoreBreakdown.language.score, 0);
  assert.ok(
    result.blockers.some(
      (item) =>
        item.type === "hard" &&
        item.reason.includes("requires German"),
    ),
  );
});

test("contextual mandatory-language cues work across varied wording", () => {
  const requirements = [
    "Excellent command of German and English is essential.",
    "The successful candidate needs business-level German.",
    "Professional German proficiency is a prerequisite for this position.",
    "Deutschkenntnisse sind zwingend erforderlich.",
    "Deutsch auf C1-Niveau.",
  ];

  for (const requirement of requirements) {
    const result = screenLanguageRequirement(requirement);

    assert.equal(result.verdict, VERDICTS.SKIP, requirement);
    assert.ok(
      result.blockers.some((item) => item.reason.includes("requires German")),
      requirement,
    );
  }
});

test("contextual optional and negated German wording does not create a blocker", () => {
  const optionalStatements = [
    "English is required, German is a plus.",
    "German would be advantageous; English is required.",
    "German is preferred, while English is mandatory.",
    "German is not required; fluent English is essential.",
    "You will collaborate with customers in the German market.",
    "You must understand the German market and its regulations.",
    "The role requires supporting German-speaking customers in English.",
  ];

  for (const statement of optionalStatements) {
    const result = screenLanguageRequirement(statement);

    assert.equal(
      result.blockers.some((item) => item.reason.includes("requires German")),
      false,
      statement,
    );
  }
});

test("German R&D grant knowledge is not treated as a language requirement", () => {
  const result = screenLanguageRequirement(
    "Basic knowledge of IT Capitalization (IFRS) and Forschungszulage (German R&D grant) is a must.",
  );

  assert.equal(
    result.blockers.some((item) => item.reason.includes("requires German")),
    false,
  );
  assert.equal(result.scoreBreakdown.language.score, 8);
});

test("a verified alternative satisfies German-or-English wording", () => {
  const result = screenLanguageRequirement(
    "Either German or English is required for the role.",
  );

  assert.equal(result.blockers.length, 0);
  assert.equal(result.scoreBreakdown.language.score, 10);
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
    result.keyGaps.includes(
      "The posting does not state a clear location or working model. Confirm where the role can be performed.",
    ),
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

test("Founder's Associate is a strong target role", () => {
  const result = screenJob(
    {
      title: "Founder's Associate",
      location: "Berlin",
      text: "Quarterly planning, KPI and OKR reviews, cross functional collaboration, and English required.",
    },
    candidateProfile,
  );

  assert.equal(result.verdict, VERDICTS.APPLY);
  assert.equal(result.scoreBreakdown.roleFunction.score, 35);
  assert.ok(
    result.strongestMatches.includes(
      "Strong role fit: Founder's Office / Founder's Associate",
    ),
  );
});

test("Head of Operations is a strong target role", () => {
  const result = screenJob(
    {
      title: "Head of Operations",
      location: "Berlin",
      text: "Process improvement, people management, operating rhythms, and English required.",
    },
    candidateProfile,
  );

  assert.equal(result.verdict, VERDICTS.APPLY);
  assert.equal(result.scoreBreakdown.roleFunction.score, 35);
  assert.ok(
    result.strongestMatches.includes("Strong role fit: Operations Leadership"),
  );
});

test("generic remote work keeps a neutral score and explains the uncertainty", () => {
  const result = screenJob(
    {
      title: "Chief of Staff",
      location: "Remote",
      text: "Process improvement and English required.",
    },
    candidateProfile,
  );

  assert.equal(result.scoreBreakdown.location.score, 8);
  assert.ok(
    result.keyGaps.includes(
      "The posting says remote but does not confirm where you may work from. Check the eligible countries.",
    ),
  );
  assert.equal(
    result.keyGaps.includes(
      "The posting does not state a clear location or working model. Confirm where the role can be performed.",
    ),
    false,
  );
});

test("unknown title seniority is not presented as an actionable gap", () => {
  const result = screenJob(
    {
      title: "Chief of Staff",
      location: "Berlin",
      text: "Program management and English required.",
    },
    candidateProfile,
  );

  assert.equal(
    result.keyGaps.includes("Seniority could not be confirmed from the job title."),
    false,
  );
});

test("unknown role titles become concrete user decisions", () => {
  const result = screenJob(
    {
      title: "Product Partnerships Manager (m/w/d)",
      location: "Berlin",
      text: "AI tools, KPI definition, performance management, and partner operations.",
    },
    candidateProfile,
  );

  assert.ok(
    result.keyGaps.includes(
      "“Product Partnerships Manager (m/w/d)” is not in your saved target directions. Decide whether this role belongs in your search.",
    ),
  );
  assert.equal(
    result.keyGaps.some((gap) => gap.includes("could not be classified")),
    false,
  );
});

test("operations role families match despite different seniority wording", () => {
  const profile = buildCandidateProfile({
    configured: true,
    targetRoles: ["Operations Management"],
    potentialRoles: [],
    skipRoles: [],
    preferredSeniority: ["Director"],
    potentialSeniority: [],
    skipSeniority: [],
    preferredLocations: ["Berlin"],
    verifiedLanguages: ["English", "Italian"],
    unavailableLanguages: ["German"],
    strengths: [
      "Customer experience",
      "AI and automation",
      "Process improvement",
      "Business development",
      "Team leadership",
    ],
  });
  const result = screenJob(
    {
      title: "Director of Operations & Service Growth",
      location: "Berlin",
      text: [
        "Build operating models and improve customer experience through AI and automation.",
        "Strong experience in multi-location restaurant, delivery, logistics, hospitality, or service-based operations.",
        "Lead managers and improve conversion, retention, and contribution margin.",
      ].join(" "),
    },
    profile,
  );

  assert.equal(result.scoreBreakdown.roleFunction.score, 35);
  assert.equal(result.verdict, VERDICTS.MAYBE);
  assert.ok(
    result.strongestMatches.includes("Strong role fit: Operations Management"),
  );
  assert.ok(
    result.keyGaps[0].includes("multi-location restaurant, delivery, logistics"),
  );
  assert.equal(
    result.keyGaps.some((gap) => gap.includes("saved target directions")),
    false,
  );
});

test("covered experience requirements are not repeated as risks", () => {
  const result = screenJob(
    {
      title: "Senior Product Operations",
      location: "Berlin",
      text: `${strengthText}. Strong experience in stakeholder management is required.`,
    },
    candidateProfile,
  );

  assert.equal(
    result.keyGaps.some((gap) => gap.includes("stakeholder management")),
    false,
  );
});

test("sennder-style Product Operations role matches reviewed CV concepts", () => {
  const profile = buildCandidateProfile({
    configured: true,
    targetRoles: ["Product Operations"],
    potentialRoles: [],
    skipRoles: [],
    preferredSeniority: ["Head"],
    potentialSeniority: [],
    skipSeniority: [],
    preferredLocations: ["Berlin"],
    verifiedLanguages: ["English", "Italian"],
    unavailableLanguages: ["German"],
    strengths: [
      "Cross-functional Product, Marketing, Data & Engineering leadership",
      "AI-enabled workflows",
      "forecasting & dashboards",
      "Stakeholder management",
    ],
  });
  const result = screenJob(
    {
      title: "Head of Product Operations (Maternity cover, 1 year contract)",
      location: "Barcelona · Berlin · Amsterdam",
      text: [
        "Partner with the CPTO and senior stakeholders across Product and Engineering.",
        "Drive quarterly planning, goal setting, and operational cadence.",
        "Lead AI adoption and transformation initiatives.",
        "Own portfolio reporting and planning dashboards.",
        "Facilitate cross-functional collaboration between Product, Engineering, Operations, Finance and Commercial teams.",
      ].join(" "),
    },
    profile,
  );

  assert.equal(result.verdict, VERDICTS.APPLY);
  assert.ok(result.score >= 75);
  assert.equal(
    result.keyGaps.some((gap) => gap.toLowerCase().includes("location")),
    false,
  );
  assert.equal(
    result.keyGaps.some((gap) => gap.includes("CV memory")),
    false,
  );
  assert.ok(
    result.strongestMatches.includes(
      "Cross-functional Product, Marketing, Data & Engineering leadership",
    ),
  );
});
