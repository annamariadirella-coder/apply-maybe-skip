# JobOps matcher — V1

## Active collection

Google Apps Script runs the private collection daily between 09:00 and 10:00 Europe/Berlin. The public JobOps repository stores generalized code, documentation and synthetic CI only. The old GitHub collection workflow, its dedicated Actions secrets and activation variable have been removed.

Google Drive remains the source of truth for Career Evidence Bank, Positioning & Targeting Charter and Job Search Tracker. No career history, credentials, source IDs or live reports are committed. This service is integrated into JobOps; use the root dashboard for opportunity review and tracking.

## Flow

```text
Private Google Apps Script daily trigger
  -> read fresh Evidence Bank + Charter + Tracker
  -> configured/learned Greenhouse / Lever / Ashby boards + Arbeitnow / Jobicy / Remotive
  -> deterministic role, location and language filters
  -> Tracker and URL / provider-ID / company-role deduplication
  -> authoritative posting detail recheck
  -> optional opt-in AI evidence scoring within the same scan/lock
  -> private Drive candidates.json + candidates.md + pending-review state
  -> evidence-based review in chat
  -> only credible APPLY / MAYBE recommendations
```

The collector defaults to unassessed candidates. Optional Apps Script AI scoring uses fresh Drive sources and the same schema, rubric and decision thresholds as merged Python; all assessments require human approval. Pending roles are retained and revalidated; roles recorded in the Tracker are removed. Never fill a shortlist quota with weak matches. No automatic applications, outreach or Tracker writes are implemented. See [opt-in configuration and safe rollout](apps-script/README.md#opt-in-evidence-scoring).

The Apps Script collector configures 374 boards across Greenhouse, Lever, Ashby, Personio, Recruitee, SmartRecruiters and Workable. The compact authoritative list is `BOARD_ROWS` in `apps-script/Code.gs`; `context/apps_script_boards.json` mirrors it. New boards are optional and not all live-verified. The optional Python pipeline retains its original 43-board list in `context/boards.json`. The active Apps Script additionally searches the free public feeds from [Arbeitnow](https://www.arbeitnow.com/blog/job-board-api), [Jobicy](https://jobicy.com/jobs-rss-feed) and [Remotive](https://github.com/remotive-com/remote-jobs-api), across companies, with deterministic role-family and territory filters. No API keys or new accounts are required for these public feeds. Source attribution and original source links are retained. Jobicy has a seven-day publication window and three-hour delay; Remotive delays public listings by 24 hours. Arbeitnow and Jobicy have a ten-page bound per scan, reported explicitly as `truncated` when reached. Each source reports fetched postings, company count, matching role families and deduplicated leads. These counts never imply suitable roles or entire-market coverage. See [coverage review](context/coverage_review.md) for the manual comparison plan and remaining gaps.

Aggregator results are separate `discovery_leads`, with `employer_live_verified=false`: they require original-employer verification before any recommendation. They never receive a fake live-check timestamp or APPLY/MAYBE verdict. Supported ATS URLs found in eligible listings are learned privately in Drive state; configured and learned boards share one persisted rotation, defaulting to 80 attempted boards per run. Only known public ATS domains are recognized, and pagination URLs are constructed locally instead of following arbitrary feed links. The optional Python pipeline supports configured company boards only; these market feeds and learned-board rotation run in the active Apps Script.

The review packet holds at most 20 employer-verified candidates; this is not a shortlist quota. Deferred eligible postings remain in the private queue. New postings are checked first, followed by the least recently checked ones, so the cap cannot starve the queue. An empty shortlist is valid. Source access or unrecognized Tracker headers stop collection; provider errors are isolated and reported as partial coverage without blocking other boards. Missing optional boards appear in board statistics. Apps Script's script lock prevents concurrent runs. Output writes are not transactional across files, so interrupted runs can repeat a safe write.

Arbeitnow's ten-page allowance is a per-run work budget, not a permanent cutoff. Every run checks pages 1–3 for new postings, then resumes its historical sweep from a private Drive checkpoint, overlapping one previous page. At the end of the feed the sweep resets to page 4. Reports include the exact pages visited, next backlog page and whether the cycle ended. Legacy ten-page runs migrate from their last private report. Failed crawls do not advance the checkpoint; retries may replay safe work. Offset pagination changes as postings are inserted or removed, so this reduces gaps but is not an exhaustive snapshot guarantee. The Jobicy feed currently restarts each scan within its seven-day window; its opaque cursor expires after 24 hours and is not treated as a durable daily checkpoint.

Unreviewed market leads also remain in a separate private queue across page changes and outages, with their last-seen timestamp when available. Feed absence never establishes closure. They remain unverified until the original employer page is checked, and Tracker entries or duplicates remove them from the queue. The initial upgrade carries forward the prior report's research leads.

## Structure

```text
apps-script/         active private collector, manifest and setup instructions
context/             public policy and configured company boards
prompts/             optional AI interpretation and evidence contracts
src/                 optional local Python orchestrator and adapters
data/                ignored local data; production state stays on Drive
tests/               synthetic Python and Apps Script checks
output/              ignored local output and setup files
.github/workflows/   synthetic CI only, no collection schedule
```

## Setup and credentials

For the active scheduler, follow [Apps Script setup](apps-script/README.md). Keep the default Google Cloud project, enable Drive v3 and Sheets v4, and authorize the personal script. Store these values in private Script Properties, never the repository:

| Property | Purpose |
|---|---|
| EVIDENCE_FILE_ID | Career Evidence Bank on Drive |
| CHARTER_FILE_ID | Positioning & Targeting Charter on Drive |
| TRACKER_SHEET_ID | Native Google Sheets Tracker |
| TRACKER_RANGE | Full applications tab |
| OUTPUT_FOLDER_ID | Initial private output folder for state migration |

Run `initializeOutputFolder` once, then `scanJobs`. After a successful live test, run `enableDailyScan` once. The script creates its own private output folder and carries forward the pending queue. Its resulting folder ID is stored in Script Properties. The old folder is retained. Do not deploy a public web app or enable a second writer.

Scopes: `drive.readonly`, `drive.file`, `spreadsheets.readonly`, `script.external_request`, `script.scriptapp`. Source and Tracker reads are read-only; output access is restricted to this app's files. Google manages the script's authorization; no desktop OAuth refresh token is stored in GitHub for daily collection. No new account, public website or paid AI API is required. Apps Script quotas still apply; check Executions for failures.

## Optional local Python pipeline

The Python implementation remains available for development and explicit future opt-in. Install Python 3.12+ and `pip install -r requirements.txt`. Run `python -m unittest discover -s tests -v`, `node tests/apps_script.test.cjs`, and `python -m src.daily_scan --demo` for synthetic checks.

A live local invocation needs Google authorized-user or service-account credentials in the environment, the five source/output settings above and `AGENT_ENABLED=true`. `.env.example` contains placeholders; `.env` is not loaded automatically. OAuth bootstrap is `python -m src.authorize_google --client-secret <local-file>`, with credentials saved only in ignored output/. Desktop testing OAuth tokens can expire after seven days; the active Apps Script scheduler does not use them.

Default `AGENT_MODE=collect` makes no AI calls. Optional `AGENT_MODE=ai` additionally requires explicit `ALLOW_PAID_AI=true`, `OPENAI_API_KEY`, and `OPENAI_MODEL`. That mode is billable and disabled in the current configuration. Never run Python against the active Apps Script output folder concurrently.

Optional AI interprets JDs and maps fit to evidence; deterministic code handles discovery, filters, deduplication and verdict guardrails. Source and JD content are untrusted reference data. Exact-quote and schema checks reject unsupported citations, but human review remains necessary. Direct clarification from the candidate outranks Evidence Bank, which outranks Charter; old tailored CVs cannot establish new facts. Do not inflate collaboration into ownership or training into professional technical expertise. No automatic applications or outreach.

## Next steps

- Verify optional board slugs and compare actual rotation coverage with reports.
- Audit filters against manually reviewed roles, particularly explicit language requirements.
- Keep Apps Script aligned with the private repository after changes.
- Add private report history and a review queue with explicit disposition tracking.
- Add optional notifications or CV generation only when requested.
- Record confirmed career clarifications in the Drive Evidence Bank, not in GitHub.

## Collector runtime budget

Greenhouse lists are fetched without content=true; only eligible titles/locations receive full detail requests. ATS calls use fetchAll batches (default 8). BOARD_BATCH_SIZE defaults to 80, SCAN_BUDGET_MS to 270000 and BOARD_PAGE_LIMIT to 3. State remains version 1 and preserves queues, feed checkpoints and old fields. Lever and SmartRecruiters pagination also resumes per board. At the soft deadline the collector stops starting requests and saves state before reports. In-flight network requests cannot be cancelled; the six-minute Apps Script limit cannot be guaranteed. With 374 boards and 80 per run, a nominal visit cycle takes five executions, excluding interruptions and learned boards; a visit does not imply all postings were scanned. These changes must also be installed in the existing private Apps Script project; a GitHub commit does not deploy it.
