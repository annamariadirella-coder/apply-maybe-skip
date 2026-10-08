# Private Google Apps Script collection

Arbeitnow pagination resumes across runs using private `feed_progress` state: pages 1–3 check new listings, the remaining seven requests advance the backlog with one-page overlap. The sweep restarts at page 4 when the feed ends. Migration derives the initial continuation from the last report, so an existing ten-page scan can continue past page 10. Errors retain the previous checkpoint. Reports show visited pages, next backlog page and end-of-cycle status. Market research leads persist in `discovery_review`, remain unverified and are removed when recorded in the Tracker or duplicated by an employer posting. None of this establishes complete market coverage; the full limitations are in the main README.

Alternative scheduler for the no-paid-AI collection mode. This is a standalone personal script, not a public web app. No public repository or website is needed. Google handles authorization when the owner runs the script; the GitHub scheduler's seven-day testing refresh token is no longer involved in daily collection.

Copy `Code.gs`, `Scoring.gs`, `ScoringConfig.gs` and `appsscript.json` into your standalone Apps Script project under the same Google account. Keep the default Apps Script Cloud project; do not attach the earlier external/testing OAuth project. Show the manifest through Project Settings. Store the five source configuration values/range/folder in private Script Properties (names in `CONFIG_KEYS`); never commit their values. Authorize only the manifest scopes. Source files and Tracker are read-only; `drive.file` is for this app's output only. Additional permissions allow public ATS HTTP requests and a daily trigger.

Run `initializeOutputFolder` once: the script creates its own private output folder for a new setup. For an existing setup, keep its folder and pending state. Then run `scanJobs` manually and verify its output in Drive.

After the manual scan succeeds, disable the old GitHub scheduler (`AGENT_ENABLED=false`) and run `enableDailyScan`. It runs once daily between 09:00 and 10:00 Europe/Berlin, not at an exact minute. Do not deploy it as a web app. Source outages are isolated, recorded as partial coverage and do not block other boards. Unknown or malformed tracker columns stop collection before output is written.

Coverage configures 374 company boards across seven ATS providers, matching context/apps_script_boards.json (optional Python keeps context/boards.json), plus the free public Arbeitnow, Jobicy and Remotive feeds, configured in context/discovery_sources.json. Role-family, location and language filters apply across companies. Each source reports counts, errors and pagination bounds; Arbeitnow and Jobicy stop after ten pages and mark truncated coverage if needed. Remotive delays data 24 hours; Jobicy covers the latest seven days with a three-hour delay. All attribution and source links are preserved. Aggregator leads remain separate and require original employer verification before recommending them. Supported public ATS links found in eligible records are learned in private Drive state, with configured and learned boards sharing one rotation of up to 80 boards per run. This does not cover the whole market; context/coverage_review.md documents gaps and periodic manual comparison.

Default collector-only candidates have no fit verdict. Optional AI assessment runs after collection, Tracker suppression and authoritative employer verification, inside the same scan and script lock. Deferred roles are queued and rotated for validation, with a maximum of 20 validated candidates per packet. Pending roles are retained and revalidated until the Tracker records them, including APPLY and SKIP assessments. Native Google Docs, stored DOCX and text references are supported. Personal Apps Script quotas apply (including run duration); inspect Executions for failures. Python remains a development alternative and must not write to the active output folder concurrently.

Validation: `node tests/apps_script.test.cjs`, followed by a manual live run in Apps Script. Node tests do not replace Google's permission/Drive integration check.

## Updating an existing project

Replace Code.gs and add/replace Scoring.gs and ScoringConfig.gs in the existing private project. Keep the existing manifest, private Script Properties, output folder and trigger. Do not rerun initializeOutputFolder or enableDailyScan on an existing setup. Run scanJobs once and check Executions and the three private output files. No live installation is implied by updating GitHub.

Optional Script Properties: BOARD_BATCH_SIZE=80, FETCH_BATCH_SIZE=8, SCAN_BUDGET_MS=270000, BOARD_PAGE_LIMIT=3. All have defaults. The soft deadline reserves time for writes but cannot interrupt in-flight requests. State is still version 1; pending_review, discovery_review and feed_progress survive. New optional slugs can be unavailable without making the run fail; inspect board_stats to audit coverage.

## Opt-in evidence scoring

Set these only in the existing project's private Script Properties:

| Property | Default / meaning |
| --- | --- |
| AI_SCORING_ENABLED | Disabled unless exactly `true`; explicit opt-in to billable API calls and sending filtered evidence/Charter paragraphs to OpenAI |
| OPENAI_API_KEY | Required privately when enabled; never commit or log |
| OPENAI_MODEL | Required explicit Responses/Structured Outputs compatible model; no guessed default |
| AI_MAX_JOBS | 3; integer 1–20, limits paid requests per scan |
| AI_APPLY_SCORE_MIN | 80; integer 0–100 |
| AI_MAYBE_SCORE_MIN | 65; integer 0–100, no greater than APPLY minimum |
| AI_APPLY_CONFIDENCE_MIN | 75; integer 0–100 |

Disabled or invalid AI configuration makes no API calls and retains collector-only output. Missing/unreadable core source files and malformed Tracker headers retain the existing fail-closed behavior. Empty/oversized filtered AI sources fall back to collector-only mode. Evidence and Charter are read fresh once per scan; DOCX paragraph boundaries (including table paragraphs and limitations) are preserved. Obvious email, link and credential paragraphs are excluded from AI input. Private source excerpts are sent only in the opted-in API request and stored only with assessments in the existing private output; no full sources, API keys, prompts, response bodies or exception details are logged. `store:false` disables stored API responses; this is not a guarantee of zero provider retention.

The generated schema, prompt and policy match merged Python exactly. Regenerate with `python scripts/sync_apps_script_scoring.py` after changes; parity tests guard against drift. Score and confidence are separate integers 0–100. Dimension maxima are business problem 30, seniority/ownership 20, functional fit 15, location/work model 10, domain 10 and scope/compensation 15. Code verifies the sum, schema and exact JD/Evidence Bank/Charter citations before applying Python's deterministic decision precedence: explicit incompatible location/seniority/pay, mandatory professional German or genuine must-have gaps → SKIP; critical unknowns or user-controlled steps → BLOCKED; transferable must-haves, uncertain location/seniority, low score/confidence → MAYBE (or SKIP below the MAYBE minimum); otherwise APPLY. Germany/remote Europe eligibility and ownership boundaries are in the shared prompt. Missing evidence must remain unknown; source limitations cannot support positive claims. Exact citations cannot prove semantic correctness, so all verdicts require the candidate's review.

Each assessed candidate has nested `scoring` with rationale, dimension scores, requirement mapping, strongest direct evidence, transferable evidence, gaps, blockers and at most two factual questions. Unscored candidates have no score or verdict. Packet `fit_assessed` is true only when every validated candidate was assessed; `ai_scoring` reports status/counts and `decision_counts` summarizes assessed roles. Aggregator leads are never scored. The Markdown packet displays evidence and questions for human review. No application, outreach, Tracker write or auto-submit is added.

Scoring gets only the time remaining after the existing collection/verification work. It starts a request only with at least 60 seconds left before the scan's soft deadline, makes one attempt without retries, and stops further requests after the first failure. Per-job errors/refusals/incomplete or unsupported answers produce collector-only candidates while the existing state and all three outputs are saved. Request caps/time limits leave candidates pending for future runs; private `ai_scoring_progress` rotates attempts among candidates. Prior scores are removed on every live recheck, including disabled runs, rather than reused with stale sources. No second scheduler, concurrent writer, new OAuth scope or public deployment is needed. In-flight requests cannot be cancelled, so the existing Apps Script hard-runtime limitation still applies.

Before enabling: run `scanJobs` with AI disabled, then with explicit private opt-in and `AI_MAX_JOBS=1`; inspect `ai_scoring`, citations and the human approval flag in private outputs. Set `AI_SCORING_ENABLED=false` to roll back to collection without changing the trigger, folder or queue. Synthetic validation is `node tests/apps_script.test.cjs` and `python -m unittest discover -s tests -v`; a real Apps Script permission/source/API check remains necessary after installation.

API contract: [official OpenAI Structured Outputs documentation](https://developers.openai.com/api/docs/guides/structured-outputs).


## Coverage diagnostics (2026-10-08)

Code.gs now persists backward-compatible `board_health` records in processed_jobs.json (version 1): last attempt, last successful page, last completed listing, consecutive failures and HTTP/error classification. candidates.json includes collector_version and the full board_coverage.inventory; candidates.md includes the same inventory and source diagnostics. Briefings can read these from Drive without GitHub. Unique completed boards and page successes are separate; a pagination checkpoint is not complete coverage.

404/410 are endpoint-not-found, 401/403 access-denied, 429 rate-limited, 5xx server errors; incomplete JDs and transport failures are separately identified. `retryable` is diagnostic guidance, not an automatic retry schedule. Pending validation failures remain queued. A valid empty listing counts as successful. No source-file or Tracker writes were added.

Live audit of the 58 unavailable endpoints from the 8 October report: all returned 404 from this execution environment. Personio .com variants did not resolve them. Two replacement feeds were verified as valid JSON listings: WorkMotion on Workable (34 postings), Wooga on Greenhouse (3 postings). Remaining unavailable boards still require investigation; do not describe all 374 as verified.

Install by replacing only Code.gs in the existing Apps Script project and saving. No deployment or trigger change is required. Existing Scoring.gs/ScoringConfig.gs, if installed, are preserved; Code.gs also works without the optional scoring module. Do not enable paid AI scoring as part of this diagnostic update. Execute scanJobs once and verify collector_version `2026-10-08-diagnostics-1` in candidates.json. The active Apps Script was not updated by the GitHub commit.

Validation: run `node tests/apps_script.test.cjs` and `node tests/apps_script_diagnostics.test.cjs`.


## Recovery update (2026-10-08-recovery-2)

Personio roles still require fresh presence in the employer feed. When feed descriptions are empty, fetch the exact employer job page, verify its canonical identity and application link, and extract only its description block. All 18 incomplete JD pages from the 12:44 Berlin run were fetched and their descriptions recovered locally (2,650–9,829 characters). Live closure, identity mismatch or an unrecognised/incomplete page remains excluded or queued.

Workable receives a separate rotating batch (default two boards per scan, WORKABLE_BOARD_BATCH_SIZE configurable from one to three). At most two Workable API calls execute per scan, sequentially, including validation calls. A 429 stops further Workable requests and persists a one-hour retry-after timestamp; other ATS providers continue. Deferred jobs stay queued. Two calls can still receive 429; no elimination of external rate limits is guaranteed. Existing v1 and legacy cursor fields are preserved, with new primary_board_rotation/workable_board_rotation fields.

Four valid replacement feeds were checked live: bloomon (Lever), HousingAnywhere (Greenhouse), Lepaya (Personio), Beam AI (Workable joinbeam). Verified career-page fallbacks for Picnic, Studocu, MR MARVIS, Swapfiets, Felyx and Parkos are included in the Drive inventory for complementary search; these are not claimed as automated feeds. Komoot and Causal endpoints remain unresolved. No paid AI or source writes were added. Replace only Code.gs; no trigger/deployment change. After scanJobs completes, verify collector_version 2026-10-08-recovery-2 in the saved report.

## Consolidated JobOps source audit

The canonical files are in this directory. The 8 October 2026 audit of 374 catalog entries verified 160 feeds, found 93 missing endpoints, left 99 unverified and deferred 22 Workable checks to respect quotas. The full dated snapshot is `board-audit.json`; this is independent of fresh Apps Script health. Confirmed 404/410 feeds are paused in rotation but remain in the report inventory. `RETRY_UNAVAILABLE_BOARDS=true` enables a diagnostic retry. `active_company_boards` and `paused_company_boards` distinguish the active rotation from the full catalog; attempted boards do not imply completion.

Import the private `candidates.json` into the JobOps dashboard. Keep your existing Drive folder, trigger and Script Properties when updating Code.gs. See the root migration guide.
