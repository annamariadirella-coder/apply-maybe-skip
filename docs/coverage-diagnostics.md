# Coverage and opportunity diagnostics

The collector report is a bounded review packet, not the collected market or a fit verdict. A missing posting alone does not prove a filter rejection, a Tracker match, a closed vacancy or an empty employer board.

## Offline HiringCafe reconciliation

Run `node scripts/audit_hiringcafe.mjs /private/candidates.json /private/details.json /private/groups.json`. This reads the three files without network access or writes. Only aggregate counts go to stdout. The exported `audit()` function also returns row-level results for private local analysis; never commit those results or raw inputs.

The grouped export's `companies[].jobs[].job_id` joins to the details export's `jobs[].requisition_id`. Count references, unique references, joined details and missing details separately. `total` is search metadata; one grouped page is not a complete export. The audit reports its page number and does not treat references without details as assessable vacancies.

Canonical URL matches establish presence in the candidate/lead packet. Company/title matches are possible identities requiring confirmation. Unsupported providers, absent/unrecognized boards, current-run outages and unchecked boards are coverage categories; they do not establish an applicant's suitability. A row's filter replay uses the current repository rules and the fields actually available in the export. It is explicitly not the historical rejection reason. Without a full JD, language requirements remain unverified. No private Tracker or processed state is read by this audit.

## Report contract

Existing report version 1 fields remain available. Additions:

- `board_coverage.boards_attempted_this_run`: distinct board keys in actual page events, rather than scheduled batch size.
- `boards_completed_this_run`, `boards_incomplete_this_run`, `boards_not_attempted_this_run`, `current_run_counts`: final event per board. A checkpoint followed by success counts as completed; success followed by failure counts as unavailable.
- `completion_ratio`: completed / configured, including paused boards in the denominator; null when no boards are configured. This is configured-source coverage, never whole-market recall.
- `inventory[].current_run_status` and `current_run_reason`: separate from historical health and `last_success_at`. Paused and unattempted sources are not unavailable attempts. Page checkpoints are incomplete even after a historical successful crawl.
- `opportunity_diagnostics`: private disposition records per stage and job key, with evaluation counts and final retained-record counts. Records contain identity, source URL, stage, reason and optional failure diagnostics; no JD or candidate evidence text.

Stages are `listing`, `queue` and `discovery`. Reasons distinguish configured role exclusions, junior/student roles, unknown versus restricted location, required German, Tracker matches, inactive/unlisted postings, duplicates, failed validation, posting disappearance, report/time limits, queued validation and discovery leads requiring employer checks. These are collection outcomes, not APPLY/MAYBE/SKIP judgments. Filters themselves retain their existing semantics.

Each stage retains at most 1,000 records (3,000 total) to prevent listing volume from consuming the validation/discovery allowance. `records_truncated` and `omitted_events` disclose loss. Evaluation counts include repeated evaluations; retained counts refer to the final record for a stage/key, cover retained records only and cannot be summed into unique vacancies. Diagnostics reset each scan and never become processed-state fields. The JSON and Markdown packets include them; the dashboard shows readable counts and inspectable source links. An old packet displays unknown additions rather than inventing them.

Board-level 404/410 or incomplete validation listings are errors, not empty lists proving a queued posting closed. Existing pending jobs survive those failures. The dated embedded audit uses legacy `provider:board` keys while runtime health uses `provider:board:region`; lookup now accepts the legacy key for global boards only. Region-specific keys take precedence and do not inherit another region's legacy audit. The existing `RETRY_UNAVAILABLE_BOARDS=true` override still permits diagnostic retries.

## Free ATS feasibility review — 2026-10-20

No provider was added or enabled. No paid service, API account or token was used.

Teamtailor's [documented API](https://docs.teamtailor.com/) requires an API key; Public Read is an account-issued permission, not anonymous access ([vendor setup guidance](https://support.teamtailor.com/en/articles/5963369-use-our-teamtailor-api)). A separate anonymous employer feed at `https://career.teamtailor.com/jobs.json` returned HTTP 200, 14 items and fields including `url`, `content_html` and `_jobposting`; this sample had no `next_url`. That confirms one feed works, not cross-employer completeness, pagination or runtime reliability. A future adapter needs multiple employer/region samples, custom-domain handling, bounded same-origin pagination, cycle detection, schema/identity checks and fresh posting verification. Treat missing or malformed feeds as unavailable.

For Workday, an anonymous, one-row POST to `https://nvidia.wd5.myworkdayjobs.com/wday/cxs/nvidia/NVIDIAExternalCareerSite/jobs` returned HTTP 200 with `total: 2000`, `jobPostings`, facets and an external path. The list had no full description. Workday's [published API reference](https://community-content.workday.com/en-us/public/products/platform-and-product-extensions/soap-api-reference.html) does not establish the contract for that observed CXS career-site endpoint. One successful sample does not establish a complete or stable anonymous API. Defer support until tenant/site discovery, count ceilings, deterministic pagination, detail hydration, exact requisition identity, closure and 403/429 handling pass across multiple sites and the Apps Script runtime. Never infer that 2,000 is the true employer vacancy total from this probe.

## Migration, risks and rollback

This change is repository-only. Do not install it over a newer deployed collector solely because the report version is 1. Compare the deployed source with this branch first: a later operational collector may contain filters, queues, archives and discovery sources absent from the repository base. Port the diagnostics into that source or reconcile it in a separate reviewed change; replacing it wholesale would regress behaviour.

No production migration was performed. No trigger, Script Property, source Tracker, private input, pending queue or processed file was changed. Workspace storage and state remain version 1; no reset or queue rebuild is needed for these additive report fields. The audit is read-only and independent of installation. Dashboard imports continue preserving existing application statuses and notes.

If deployment is approved later, retain the exact prior source and private output/state backups in the owner's environment, compare configuration and run a synthetic/staging scan first. Verify queue preservation, caps and current-run board counts before any production installation. Do not create another trigger or initialise another folder. The corrected audit lookup can pause globally audited missing feeds that the old lookup accidentally attempted; review active/paused counts and use only the existing explicit retry override when desired.

Rollback: revert this PR's source changes, regenerate the collector test copy, and reload the local dashboard/extension. If a future manual Apps Script installation occurs, restore the saved prior source without resetting state or touching the existing trigger/Tracker. New report fields are additive and old consumers ignore them; a newly imported legacy report replaces the coverage display with its available fields. Reverting source does not undo any future real-world collection run, so never delete pending or processed data as a rollback step.

Remaining limits: bounded logs can omit individual reasons; legacy reports cannot reconstruct them. Rules remain heuristics. Validation is intentionally conservative on incomplete feeds. Local automated checks cover DOM behaviour, not a live Apps Script deployment or multi-provider service guarantee.
