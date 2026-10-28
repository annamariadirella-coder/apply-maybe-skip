# JobOps agent map

Use this file as the short entry point for repository work.

- Read `.agents/skills/job1-review/SKILL.md` for the repeatable human review procedure.
- Read `docs/knowledge/job-search-system.md` for source ownership, architecture, decisions and known limitations.
- Read `docs/review-coordination.md` for collector/run correlation, coverage and failure handling.
- Run `node scripts/inspect_packet.mjs FILE SCAN_STARTED_AT [RUN_ID | --scheduled-snapshot]` for offline diagnostics. It never starts a scan or writes production state.
- Read `services/collector/README.md` before any collector change. `services/collector/Code.gs` is canonical; test copies are generated.
- Run `npm test`, `npm run test:collector`, and `npm run test:matcher` as required for code changes.
- Use fictional public fixtures only. Keep candidate profiles, career evidence, Tracker exports, private reports, credentials and processed state out of Git.
- Preserve discovery provenance and distinguish collected, employer verified, assessed and applied. Discovery presence is not review completion.
- Never submit applications or enable paid AI silently. Do not modify a live Apps Script installation, trigger, Tracker or collector state without explicit authorization.
