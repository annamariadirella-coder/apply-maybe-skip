/**
 * Structured verdicts returned by the screening module.
 */

export const VERDICTS = Object.freeze({
  APPLY: "apply",
  MAYBE: "maybe",
  SKIP: "skip",
});

/**
 * Placeholder contract for the rule-based screening engine.
 *
 * The scoring rules are intentionally deferred to the next milestone.
 */
export function screenJob(_jobPage, _candidateProfile) {
  return {
    verdict: VERDICTS.MAYBE,
    explanation: "Screening rules have not been configured yet.",
    strongestMatches: [],
    keyGaps: [],
  };
}
