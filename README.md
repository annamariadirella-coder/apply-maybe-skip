# Apply, Maybe, Skip

A Chrome extension that helps job seekers quickly triage job postings against their own profile and screening criteria.

> Development status: Milestone 3 is complete. The extension now reads the active job tab, runs the deterministic screening engine locally, and renders the full decision in the popup.

## Problem

Reviewing job postings is repetitive and mentally expensive. Job seekers often spend time reading roles that are an obvious mismatch, while promising opportunities can be missed among long descriptions and inconsistent requirements.

The decision is rarely a simple keyword match. A useful first pass needs to consider the candidate's target roles, preferred conditions, relevant skills, and hard blockers, then explain the result clearly.

## Solution

Apply, Maybe, Skip will analyze the visible text of the job posting open in the active browser tab and return one quick verdict:

- 🟢 **Apply** - the role strongly matches the candidate's criteria.
- 🟡 **Maybe** - the role has meaningful potential but needs closer review.
- 🔴 **Skip** - the role conflicts with a critical requirement or has too many gaps.

Each verdict includes a weighted score, a short explanation, the strongest matches, the key gaps, and any blockers. Version one runs locally with transparent, rule-based logic: no account, server, external AI service, or external API is required.

## MVP scope

The first usable version will include:

- Chrome Manifest V3 extension configuration
- Visible job-page text extraction through a content script
- A compact extension popup
- A candidate profile defined locally in source code
- Deterministic, rule-based screening and scoring
- Apply, Maybe, or Skip verdict
- Short decision explanation
- Strongest matches
- Key gaps or blockers
- Clear handling for unsupported pages and missing job text

The MVP will not include:

- Automatic applications
- User accounts or cloud synchronization
- External AI or third-party job-data services
- Support guarantees for every job board
- Resume parsing
- Storage or transmission of browsing data

Candidate criteria are limited to verified, user-provided information. The profile does not invent work history, job titles, or language proficiency levels.

## Architecture

The extension is split into four small responsibilities:

1. **Job page extraction** - the content script reads visible text and basic page metadata from the current job page.
2. **Candidate profile** - a local configuration module stores screening preferences and verified candidate facts.
3. **Screening logic** - a pure module compares extracted text with the profile and produces a structured result.
4. **Popup UI** - the popup requests page data, runs screening, and renders the verdict and supporting details.

Data flow:

    Active job tab
        ↓
    Content script: job-page-extractor.js
        ↓
    Popup controller: popup.js
        ↓
    Candidate profile + screening rules
        ↓
    Verdict, explanation, matches, gaps, and blockers

The screening engine is browser-independent. It accepts a plain object containing title, location, and text, which keeps the decision rules easy to test and tune without the extension UI. Location may be omitted; in that case the engine uses job text as a fallback for location signals such as Berlin, Germany, remote, or hybrid.

## Screening model

The engine does not count repeated keywords. Instead, it classifies the role and evaluates five independent categories. Each configured competency can match only once, regardless of how often a phrase appears.

| Category | Maximum | Reasoning |
| --- | ---: | --- |
| Role/function fit | 35 | Strong target roles receive full weight; contextual potential roles receive partial weight. |
| Seniority | 15 | Senior, Lead, and Head are preferred; Manager and Director are potential fits. |
| Location | 20 | Berlin and configured remote regions are preferred; configured hybrid arrangements receive partial weight. A preferred location such as Berlin takes precedence over a generic hybrid signal and is not double-counted. |
| Language | 10 | Only Italian and English are recorded as verified. German is explicitly not part of the candidate profile. |
| Relevant strengths | 20 | Distinct responsibility groups contribute individually and are capped at 20 points. |

The total score is between 0 and 100:

- **Apply:** 75–100, with no blocker requiring review or rejection.
- **Maybe:** 50–74, or an otherwise-Apply result with a review blocker.
- **Skip:** below 50, or any hard blocker regardless of score.

### Blocker behavior

Hard blockers override the weighted score:

- A title classified as a usually-skip function, such as pure software engineering, data engineering, DevOps, sales, or marketing
- A highly technical individual-contributor title combined with an explicit deep-coding requirement
- Intern, Junior, Entry-level, or Graduate seniority
- Mandatory relocation outside Germany
- Mandatory onsite work outside Berlin
- A mandatory German-language requirement

German listed only as optional or as a plus does not block a role. Any explicit German requirement, including fluent, native, C1, or C2 German, is a hard blocker because German is not part of the candidate's language profile.

Soft gaps do not override the score. Examples include unknown seniority or location, Director scope that needs review, and an unverified language requirement other than the explicit German rule above.

### Result contract

The screening function returns:

- verdict
- score
- explanation, always aligned with the returned verdict
- strongestMatches
- keyGaps
- blockers, including hard or review severity
- scoreBreakdown for all five categories

## Development tools

- **Cursor** - AI-assisted development environment used to build and iterate on the project.
- **GitHub** - version control and project documentation.
- **JavaScript** - extension logic and browser-side behavior.
- **Chrome Extension APIs** - browser integration and extension capabilities.
- **Chrome Manifest V3** - extension configuration and permission model.

## Project structure

    apply-maybe-skip/
    ├── manifest.json
    ├── src/
    │   ├── content/
    │   │   └── job-page-extractor.js
    │   ├── profile/
    │   │   └── candidate-profile.js
    │   ├── screening/
    │   │   └── screen-job.js
    │   └── popup/
    │       ├── analyze-job.js
    │       ├── popup.html
    │       ├── popup.css
    │       └── popup.js
    ├── tests/
    │   └── screen-job.test.js
    ├── package.json
    ├── .gitignore
    ├── LICENSE
    └── README.md

No build tooling is required for the initial MVP. Screening fixtures can be run with `npm test`.

## Candidate profile updates

The detailed candidate archive remains in a private local folder outside this
repository. A Git-ignored config connects this checkout to that folder, while a
private source index records which documents have already been reviewed.

- Run `npm run profile:status` to detect new, changed, or removed source files.
- Reconcile reported documents with the private canonical profile before
  changing screening rules.
- Run `npm run profile:index` only after the profile update has been reviewed.

This workflow survives individual chat conversations without putting raw CVs,
cover letters, personal paths, or extracted document text in Git. See
[`docs/candidate-profile-workflow.md`](docs/candidate-profile-workflow.md) for
the complete process.

## Installation

Load and test the extension locally in Chrome:

1. Clone or download this repository.
2. Open Chrome and go to chrome://extensions.
3. Turn on **Developer mode**.
4. Select **Load unpacked**.
5. Choose the repository root (the folder containing manifest.json).
6. Pin **Apply, Maybe, Skip** from the extensions menu.
7. Open a job posting on a regular HTTP or HTTPS page and select the extension icon.
8. The popup analyzes the active tab automatically. Confirm that it shows an Apply, Maybe, or Skip verdict, a score, an explanation, strongest matches, key gaps, and blockers.
9. If the page was already open when the extension was installed or reloaded, refresh that page once so Chrome can inject the content script.

Chrome internal pages, the Chrome Web Store, empty pages, and tabs without an injected content script show a clear error instead of a misleading result. Use **Analyze again** after changing or reloading the active page.

## Roadmap

- [x] **Milestone 1 - Foundation:** define the MVP, architecture, extension manifest, and module scaffold.
- [x] **Milestone 2 - Profile and rules:** add verified candidate criteria and implement deterministic screening.
- [x] **Milestone 3 - End-to-end flow:** connect page extraction, screening, and popup states.
- [ ] **Milestone 4 - Quality:** add automated tests, fixtures, error handling, and accessibility refinements.
- [ ] **Milestone 5 - Portfolio polish:** add icons, screenshots, a demo, and release documentation.

## Privacy

The planned MVP reads visible page text only when used on a supported web page. Analysis stays inside the extension. It does not send job-page content or candidate data to a remote service.

## License

This project is available under the [MIT License](LICENSE).
