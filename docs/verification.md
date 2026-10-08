# Verification

The consolidation runs the original extension and collector regression suites plus workspace integration checks and Python matcher tests. All tests use synthetic or fictional candidate data.

Covered behaviour:

- job extraction, incomplete-page handling, phrase/concept matching and language conflicts;
- persisted profile settings, document approval, evidence questions and unsupported-claim boundaries;
- collector rotation, pagination, source failure isolation, version-1 queue migration and Tracker deduplication;
- Personio exact identity/application/description gates and Workable quota/cooldown handling;
- opt-in AI schema/citation validation, bounded requests, paid-scoring-disabled behaviour and Python/Apps Script policy parity;
- collector import → tracker merge → rescan preserving statuses/notes → CSV round trip;
- profile/full-JD/freshness gates, demo isolation, unsafe URLs and spreadsheet-formula escaping.

The public source audit is a dated HTTP/format check from the development runner, not a live Apps Script run, candidate review or whole-market guarantee. Workable audit requests are deferred. Runtime health can differ by provider and environment.

A live Google installation, real private source permissions and the daily trigger must be checked in the owner's Apps Script account. No new paid AI call is part of this consolidation. Repository publication does not certify that a user has installed the new collector or extension.

The dashboard DOM integration check exercises the actual app module, fictional-demo isolation, profile saving, collector import, status/notes persistence, rescan, search and coverage. Full visual rendering in Chromium was not completed in this environment because browser downloads were unavailable; Chrome installation and layout still need a real browser check.
