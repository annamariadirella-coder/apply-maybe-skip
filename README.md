# JobOps

**Your job search, organised — from discovering a role to tracking your application.**

JobOps combines a **Chrome extension**, a **local dashboard** and an **optional vacancy collector** in one open-source project. Review opportunities against your own profile, see the reasons behind a screening signal, and keep descriptions, decisions and follow-up notes together.

**Discover → Filter → Evaluate → Decide → Track**

[Get started](#get-started) · [How screening works](#how-screening-works) · [Architecture](docs/architecture.md) · [Collector setup](services/collector/README.md)

## Why I built it

A job search involves more than finding vacancies. It means comparing requirements with real experience, revisiting employer pages, avoiding duplicate reviews and remembering what happened after applying. Those steps often end up scattered across browser tabs, documents and spreadsheets.

I built JobOps to bring that workflow together: discover opportunities, make the reasoning visible, and keep the final decision with the person applying. It started with a browser screening extension and a private collection workflow; they now share one project and a common review workspace.

## What you can do

| Feature | What it helps you do |
| --- | --- |
| **Chrome extension** | Extract an open job posting, screen it against your profile and save it to your workspace |
| **Opportunity dashboard** | Search and filter roles, inspect descriptions and review matches, conflicts and unanswered questions |
| **Your own profile** | Configure target roles, seniority, locations, languages and strengths; import CV/evidence documents through the extension |
| **Application tracker** | Keep statuses and notes with each role; import an existing tracker and export CSV or a backup |
| **Vacancy collector** | Collect and recheck supported employer postings through your own Google Apps Script installation |
| **Source coverage** | Inspect completed, unavailable and unchecked sources instead of assuming every scan is exhaustive |
| **Optional evidence matcher** | Assess requirements against cited private evidence, separately from preliminary browser screening |

A newer collector import updates matching roles while preserving their application statuses and notes. The included demo uses fictional companies and roles and stays separate from your real workspace.

## Get started

### Option 1 — Chrome extension and dashboard

No Python, API key or paid AI service is needed for this option.

1. Select **Code → Download ZIP** on this repository and extract it.
2. Open `chrome://extensions` in Chrome and turn on **Developer mode**.
3. Select **Load unpacked** and choose the extracted folder containing `manifest.json`.
4. Pin **JobOps**, open its popup and select **Open JobOps workspace**.
5. Select **Try the demo** to explore fictional opportunities, or set up **Your profile** to review your own roles.

On a job posting, open the extension and select **Save to workspace**. In the dashboard, review the full description and confirm the original employer posting before acting on a positive recommendation.

Document import is available through **Your profile → Document & evidence setup**. The extension and its dashboard share Chrome's local storage. This is currently an unpacked extension, not a Chrome Web Store release.

### Option 2 — Local dashboard

If you prefer to use the dashboard without installing the extension, install Python 3.10+ and run this command from the extracted repository folder:

```bash
python3 scripts/start.py
```

On Windows:

```powershell
python scripts/start.py
```

Open **http://127.0.0.1:8765/apps/dashboard/** and select **Try the demo**. You can add roles manually or import collector reports and tracker CSVs.

The local dashboard and the extension use separate storage. **Export backup** and **Restore backup** let you move your workspace between them or to another device. Export a backup before clearing browser data.

### Optional — Collect new opportunities

Install the [Apps Script collector](services/collector/README.md) under your own Google account. It reads your private evidence documents and targeting Charter, checks the source Tracker for duplicates, and writes reports and pending state into a private Drive folder. Collection works without enabling paid AI scoring.

Download its `candidates.json` report and select **Import scan** in JobOps. To bring in an existing tracker, export it as CSV and select **Import tracker**. Supported columns include `Company`, `Role title`, `Source`, `Status` and optional `Notes`; German aliases are also supported.

Imports are manual. There is no automatic two-way Google Sheets synchronisation. If you already use the earlier collector or extension, follow the [migration guide](docs/migration.md) to preserve your setup and data.

## How screening works

JobOps separates two kinds of review:

**Preliminary triage** runs locally in the extension and dashboard. It uses configurable rules for role, seniority, location, language and declared strengths, and explains its **Apply / Maybe / Skip** signal. The dashboard blocks positive recommendations when the profile, full description or recent employer verification is missing. Employer checks expire after 48 hours.

**Evidence assessment** is an optional private workflow. It evaluates six dimensions—business problem, ownership, function, location, domain and scope/compensation—and requires exact citations for experience claims. It distinguishes direct evidence, transferable evidence, unknown requirements and explicit gaps. Imported assessments are shown separately because they belong to the collector's source profile, which may differ from the current dashboard profile.

The default evidence policy requires a score of at least **80** and confidence of at least **75** for APPLY; MAYBE starts at **65**. Unknown must-have evidence blocks a decision, and transferable must-have evidence limits it to MAYBE. Explicit incompatibilities take precedence. These are configurable decision rules, not validated prediction thresholds.

**A score is a review aid, not an interview probability.** You review the evidence and decide whether to apply. Changing an application status records your decision; it does not send an application.

## Data and privacy

- The dashboard and extension save profile and workspace data locally in your browser.
- The collector stores its source documents, reports, credentials and queue in your own private setup.
- Optional AI scoring sends selected private evidence and job text to the configured API only when explicitly enabled. It is disabled by default.
- Public examples are fictional. Personal documents, live reports and credentials are excluded from this repository.
- JobOps does not automatically submit applications, send outreach or write back to your source Google Tracker.

Backups and imported reports can contain personal information. Keep them private.

## Current scope

JobOps is an early version built around a real job search workflow. The local workspace, browsing extension and collector are available; the collector needs a separate Google setup, and evidence scoring is optional.

The catalog contains **374 configured employer feeds** across seven ATS providers, plus public discovery sources. The [dated source audit](services/collector/board-audit.json) records endpoint checks; the imported runtime report shows actual scan coverage. A configured feed is not a guarantee of a working endpoint or a suitable vacancy. Missing endpoints are paused, other uncertain sources receive bounded retries, and Workable has a separate quota/cooldown.

Coverage is partial: unsupported career sites still need manual research, page extraction depends on the site, and a completed scan does not mean the whole market was searched. See [verification notes](docs/verification.md) for tested behaviour and remaining validation limits.

## For developers

The dashboard uses JavaScript modules and has no build step or runtime npm dependencies. The extension uses Chrome Manifest V3; collection runs in Apps Script, with a Python pipeline for optional evidence matching.

| Directory | Responsibility |
| --- | --- |
| `apps/dashboard` | Opportunity review, profile, imports and tracking |
| `apps/extension` | Browser extraction and document/evidence setup |
| `core` | Shared triage, verification gates, job identities and storage |
| `services/collector` | Canonical Apps Script source and board audit |
| `services/matcher` | Python pipeline, evidence schema, prompt, policy and regression tests |
| `examples` | Fictional demo data |
| `docs` | Architecture, migration and verification |

Requires Node.js 20+ and Python 3.10+ for development:

```bash
npm ci
npm test
npm run test:collector
python3 -m pip install -r services/matcher/requirements.txt
npm run test:matcher
```

The test suites cover extraction, screening, profile settings, dashboard flows, tracker preservation, collector recovery and Python/Apps Script evidence-policy parity. GitHub Actions runs synthetic checks without private candidate data.

After editing the canonical collector, run `npm run sync:collector` to update its test copies. `npm run audit:boards` refreshes the dated endpoint snapshot; review it before changing the embedded collector audit. Further details are in the [architecture document](docs/architecture.md).

## Contributing

Bug reports and focused improvements are welcome. For extraction problems, include the public job-page URL and what you expected to happen. Use fictional or redacted data in examples; do not include CVs, credentials or private collector reports.

## License

[MIT](LICENSE). Vendored PDF.js retains its [own license](apps/extension/vendor/pdfjs/LICENSE).
