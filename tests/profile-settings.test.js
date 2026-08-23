import assert from "node:assert/strict";
import { test } from "node:test";
import { parseList } from "../src/options/options.js";
import { candidateProfile } from "../src/profile/candidate-profile.js";
import {
  PROFILE_STORAGE_KEY,
  buildCandidateProfile,
  loadCandidateProfile,
} from "../src/profile/profile-settings.js";
import { PROFESSIONAL_MEMORY_KEY } from "../src/profile/professional-memory.js";
import { screenJob, VERDICTS } from "../src/screening/screen-job.js";

const customSettings = {
  configured: true,
  targetRoles: ["Customer Success"],
  potentialRoles: ["Account Management"],
  skipRoles: ["Software Engineer"],
  preferredSeniority: ["Senior"],
  potentialSeniority: ["Manager"],
  skipSeniority: ["Intern"],
  preferredLocations: ["Lisbon"],
  verifiedLanguages: ["English", "Portuguese"],
  unavailableLanguages: ["German"],
  strengths: [
    "Customer success",
    "Account management",
    "Renewals",
    "Stakeholder management",
    "Process improvement",
  ],
};

test("list input accepts lines, commas, semicolons, and removes duplicates", () => {
  assert.deepEqual(
    parseList("Customer Success\nProgram Manager, Operations; Customer Success"),
    ["Customer Success", "Program Manager", "Operations"],
  );
});

test("missing settings keep the repository owner's example profile", () => {
  assert.equal(buildCandidateProfile(undefined), candidateProfile);
});

test("custom settings replace owner-specific screening fields", () => {
  const profile = buildCandidateProfile(customSettings);

  assert.deepEqual(profile.roleFit.strong, [
    { label: "Customer Success", titlePatterns: ["Customer Success"] },
  ]);
  assert.deepEqual(profile.location.preferred, [
    { label: "Lisbon", patterns: ["Lisbon"] },
  ]);
  assert.deepEqual(profile.languages.verified, ["english", "portuguese"]);
  assert.deepEqual(profile.roleFit.deepCodingRequirementPatterns, []);
  assert.deepEqual(profile.location.relocationRequiredPatterns, []);
  assert.deepEqual(profile.location.onsiteRequiredPatterns, []);
  assert.equal(
    profile.strengthSignals.some((signal) => signal.label === "Product operations"),
    false,
  );
});

test("approved CV evidence extends a custom profile without adding pending facts", () => {
  const profile = buildCandidateProfile(customSettings, candidateProfile, {
    version: 1,
    sources: [{ id: "cv-one", name: "CV one.pdf" }],
    evidence: [
      {
        key: "facilitation",
        label: "Workshop facilitation",
        status: "approved",
        sourceIds: ["cv-one"],
      },
      {
        key: "sql",
        label: "SQL",
        status: "pending",
        sourceIds: ["cv-one"],
      },
    ],
  });

  assert.ok(
    profile.strengthSignals.some(
      (signal) => signal.label === "Workshop facilitation",
    ),
  );
  assert.equal(
    profile.strengthSignals.some((signal) => signal.label === "SQL"),
    false,
  );
});

test("verified languages are not treated as unsupported requirements", () => {
  const profile = buildCandidateProfile({
    ...customSettings,
    verifiedLanguages: ["English", "French"],
    unavailableLanguages: [],
  });
  const result = screenJob(
    {
      title: "Senior Customer Success",
      location: "Lisbon",
      text: "French is required. Customer success and renewals.",
    },
    profile,
  );

  assert.equal(result.scoreBreakdown.language.score, 10);
  assert.equal(
    result.keyGaps.some((gap) => gap.includes("French requirement")),
    false,
  );
});

test("German aliases remain available in a custom profile", () => {
  const profile = buildCandidateProfile(customSettings);
  const result = screenJob(
    {
      title: "Senior Customer Success",
      location: "Lisbon",
      text: "Deutschkenntnisse sind zwingend erforderlich.",
    },
    profile,
  );

  assert.equal(result.verdict, VERDICTS.SKIP);
  assert.ok(result.blockers.some((item) => item.reason.includes("requires German")));
});

test("custom profile drives screening end to end", () => {
  const profile = buildCandidateProfile(customSettings);
  const result = screenJob(
    {
      title: "Senior Customer Success",
      location: "Lisbon",
      text: [
        "English is required.",
        "Customer success and account management.",
        "Renewals, stakeholder management, process improvement.",
      ].join(" "),
    },
    profile,
  );

  assert.equal(result.verdict, VERDICTS.APPLY);
  assert.equal(result.score, 100);
  assert.equal(result.blockers.length, 0);
});

test("custom unavailable language creates a contextual hard blocker", () => {
  const profile = buildCandidateProfile(customSettings);
  const result = screenJob(
    {
      title: "Senior Customer Success",
      location: "Lisbon",
      text: "Business-level German is mandatory. Customer success and renewals.",
    },
    profile,
  );

  assert.equal(result.verdict, VERDICTS.SKIP);
  assert.ok(result.blockers.some((item) => item.reason.includes("requires German")));
});

test("saved browser settings are loaded without exposing storage details", async () => {
  const chromeApi = {
    runtime: { lastError: null },
    storage: {
      local: {
        get(keys, callback) {
          assert.deepEqual(keys, [PROFILE_STORAGE_KEY, PROFESSIONAL_MEMORY_KEY]);
          callback({ [PROFILE_STORAGE_KEY]: customSettings });
        },
      },
    },
  };

  const loaded = await loadCandidateProfile(chromeApi);

  assert.equal(loaded.isConfigured, true);
  assert.deepEqual(loaded.profile.languages.verified, ["english", "portuguese"]);
});
