# JobOps

**A personal job search workspace that turns scattered vacancies into an organised, evidence-aware review process.**

Discover → Filter → Evaluate → Decide → Track.

JobOps brings the browser screening extension and the job collection agent into one project. Add a role from a job page, import a collector scan, review why it might fit, and keep your application status and notes alongside its full description. Production profile defaults are empty; your own profile is configurable. the included demo uses fictional companies and roles.

## Try it

1. Download this repository: **Code → Download ZIP**, then extract it.
2. Install Python 3 if it is not already available.
3. In the extracted folder, run `python3 scripts/start.py` (Windows: `python scripts/start.py`).
4. Open **http://127.0.0.1:8765/apps/dashboard/** and select **Try the demo**.
5. Exit the demo and set up **Your profile** to review your own roles.

No API key, paid AI service or cloud account is needed for the workspace. Data is saved in this browser. Export a backup before changing devices or clearing browser data.

### Use it while browsing

In Chrome, open `chrome://extensions`, turn on **Developer mode**, choose **Load unpacked**, and select the extracted repository folder containing `manifest.json`. Pin JobOps. Open a job posting, click the extension and choose **Save to workspace**. **Open JobOps workspace** opens the dashboard. The dashboard and extension share the same local profile and opportunity storage.

The local web version and Chrome extension have separate browser storage. Export and restore a backup to move between them. Document and evidence import is available through **Your profile → Document & evidence setup** in the extension. No application is sent automatically.

### Bring in your collector and tracker

- **Import scan** reads `candidates.json` from the private Apps Script collector, including full descriptions, live-check timestamps and source coverage.
- **Import tracker** reads a CSV with `Company`, `Role title`, `Source`, `Status` and optional `Notes` columns. German tracker column aliases are supported.
- Importing a newer scan updates matching roles without erasing their application status or notes.
- **Export CSV** exports your real roles and decisions. Fictional demo data stays separate.
- **Source coverage** shows completed and unavailable boards from the imported report. A successful run is not proof of complete market coverage.

The existing private Google Apps Script setup continues to run separately. GitHub changes do not install themselves in Apps Script. See [collector setup and upgrade](services/collector/README.md) and [migration checklist](docs/migration.md).

## What the verdict means

The dashboard and browser extension share a deterministic screening engine. **Apply / Maybe / Skip are preliminary triage signals**, based on role, seniority, location, languages and declared strengths. A triage score is not an evidence assessment or interview probability. Missing profiles, incomplete descriptions and missing/stale employer verification block positive dashboard recommendations. Employer checks expire after 48 hours.

The optional private matcher performs a separate, cited evidence assessment across six dimensions: business problem, ownership, function, location, domain and scope/compensation. Its default decision policy requires score ≥80 and confidence ≥75 for APPLY; MAYBE starts at 65. Unknown must-have evidence blocks a decision; transferable must-have evidence limits it to MAYBE; explicit gaps and incompatible conditions take precedence. These are configurable policy defaults, not validated prediction thresholds. Imported evidence assessments are displayed separately, with their source timestamp. They do not silently replace the current local profile review.

**Human approval is the final gate.** JobOps does not submit applications, send outreach or modify the source Google Tracker. Optional paid scoring is disabled unless explicitly configured in your private collector.

## Source coverage

The collector catalog contains 374 configured employer feeds plus supported public discovery sources. A dated audit on 8 October 2026 found 160 parseable feeds, 93 missing endpoints and 99 unverified results; 22 Workable feeds were deferred to respect provider quotas. [The audit snapshot](services/collector/board-audit.json) records each result and timestamp. Verified feeds may contain zero roles and do not establish candidate fit or present-day availability.

Confirmed 404/410 endpoints are paused in the collector; their employers may still recruit through other channels. Other uncertain feeds remain eligible for bounded retries. Workable requests have their own quota/cooldown. Fresh runtime health remains separate from the audit, and manual employer research is still needed for gaps.

## Project structure

| Path | Purpose |
| --- | --- |
| `apps/dashboard` | Profile, opportunity review, imports and application tracker |
| `apps/extension` | Job-page extraction and local document/evidence setup |
| `core` | Shared triage, verification gate, identities and workspace storage |
| `services/collector` | Canonical Apps Script collector and dated board audit |
| `services/matcher` | Optional Python evidence pipeline, prompt/schema/policy and synthetic tests |
| `examples` | Fictional demonstration data |
| `docs` | Architecture, migration and verification notes |

## Development

Requires Node.js 20+ and Python 3.10+. The dashboard has no build step or runtime npm dependencies.

```bash
npm ci
npm test
npm run test:collector
python3 -m pip install -r services/matcher/requirements.txt
npm run test:matcher
```

Run `npm run sync:collector` after changing canonical collector files. The Python/Apps Script parity test checks the evidence contract and decision outcomes. `npm run audit:boards` refreshes the dated snapshot without consuming Workable quota; review results before updating the embedded collector audit. See [verification notes](docs/verification.md) for tested behaviour and limits.

Built from a real personal job search workflow. Public code contains configurable defaults and fictional examples; personal documents, private reports and credentials stay outside GitHub. MIT license; vendored PDF.js retains its own license.
