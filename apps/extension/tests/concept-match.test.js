import assert from "node:assert/strict";
import { test } from "node:test";
import {
  conceptuallyMatches,
  matchesStrengthConcept,
} from "../src/screening/concept-match.js";

test("matches meaningful token overlap inside one responsibility", () => {
  assert.equal(
    conceptuallyMatches(
      "Cross-functional Product, Marketing, Data & Engineering leadership",
      "Facilitate cross-functional collaboration between Product, Engineering, Operations, Finance and Commercial teams",
    ),
    true,
  );
});

test("matches stakeholder relationships without requiring identical wording", () => {
  assert.equal(
    conceptuallyMatches(
      "Stakeholder management",
      "Partner with senior stakeholders across Product and Engineering",
    ),
    true,
  );
});

test("matches related AI change language conservatively", () => {
  assert.equal(
    conceptuallyMatches(
      "AI-enabled workflows",
      "Lead AI adoption and transformation initiatives",
    ),
    true,
  );
});

test("does not match a generic shared word on its own", () => {
  assert.equal(
    conceptuallyMatches(
      "Customer operations",
      "Product operations across the technology organization",
    ),
    false,
  );
});

test("checks every approved signal against individual job segments", () => {
  assert.equal(
    matchesStrengthConcept(
      {
        label: "Data-driven decision making",
        patterns: ["Data-driven decision making"],
      },
      ["Use evidence to enable data-driven decisions"],
    ),
    true,
  );
});
