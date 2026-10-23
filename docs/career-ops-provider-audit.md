# Career Ops provider audit

Reviewed 2026-10-23 against [career-ops](https://github.com/career-ops-hq/career-ops).

Career Ops is MIT licensed and its `providers/` layer is built around public,
no-auth ATS APIs, RSS/XML feeds and server-rendered employer pages. It uses a
filesystem-loaded provider registry, explicit provider contracts, defensive
HTTP handling, redirect/SSRF guards and deterministic source routing.

JobOps already implements many of the same provider families in the canonical
Apps Script collector. The useful parts to carry over are the provider-family
contract, dynamic routing, safety guards and provider health diagnostics. The
company catalog and personal matching logic remain JobOps-specific.

## Current public provider coverage

The search layer now has bounded, parser-backed routes for Workday,
SuccessFactors, Oracle Cloud, iCIMS, Softgarden, Personio, BambooHR and
Jobvite, in addition to the provider families already handled by the
collector. Each route requires HTTPS, keeps the employer URL, and reports an
incomplete or unavailable source separately from an empty board.

The provider layer is global by design. Geography, language, remote mode and
role preferences are filters applied after collection, so a public instance
can serve users outside EMEA without changing the source adapters.

The compatibility catalog in
`services/search/career-ops-provider-catalog.js` is deliberately a list of
provider families, never a list of employers. It is used for gap reporting and
does not add companies to the collector. New employer boards must continue to
arrive through source discovery or a verified employer link.

## Decision

Do not vendor the whole repository. Its scanner, dashboard, CV tailoring and
tracker overlap only partly with JobOps, while JobOps has stricter Evidence
Bank boundaries, tracker safeguards and Morning Desk packet rules. Reuse
individual MIT-licensed provider techniques only after a focused review and
retain attribution when code is copied.

The next provider work should prioritize families that are in Career Ops and
not yet healthy in the JobOps board inventory. Every imported provider must
have a fixture, identity check, live-source check, failure classification and
an employer verification path.
