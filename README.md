# Apply, Maybe, Skip

A Chrome extension that helps job seekers quickly triage job postings against their own profile and screening criteria.

> Development status: initial project scaffold. The screening workflow is intentionally not implemented yet.

## Problem

Reviewing job postings is repetitive and mentally expensive. Job seekers often spend time reading roles that are an obvious mismatch, while promising opportunities can be missed among long descriptions and inconsistent requirements.

The decision is rarely a simple keyword match. A useful first pass needs to consider the candidate's target roles, preferred conditions, relevant skills, and hard blockers, then explain the result clearly.

## Solution

Apply, Maybe, Skip will analyze the visible text of the job posting open in the active browser tab and return one quick verdict:

- 🟢 **Apply** — the role strongly matches the candidate's criteria.
- 🟡 **Maybe** — the role has meaningful potential but needs closer review.
- 🔴 **Skip** — the role conflicts with a critical requirement or has too many gaps.

Each verdict will include a short explanation, the strongest matches, and the key gaps or blockers. Version one will run locally with transparent, rule-based logic: no account, server, or external AI service is required.

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

Candidate criteria will be added only from verified, user-provided information. The scaffold does not invent candidate experience.

## Architecture

The extension is split into four small responsibilities:

1. **Job page extraction** — the content script reads visible text and basic page metadata from the current job page.
2. **Candidate profile** — a local configuration module stores screening preferences and verified candidate facts.
3. **Screening logic** — a pure module compares extracted text with the profile and produces a structured result.
4. **Popup UI** — the popup requests page data, runs screening, and renders the verdict and supporting details.

Planned data flow:

    Active job tab
        ↓
    Content script: job-page-extractor.js
        ↓
    Popup controller: popup.js
        ↓
    Candidate profile + screening rules
        ↓
    Verdict, explanation, matches, and gaps

Keeping the screening module independent of the browser UI will make its behavior easier to test and refine.

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
    │       ├── popup.html
    │       ├── popup.css
    │       └── popup.js
    ├── .gitignore
    ├── LICENSE
    └── README.md

No build tooling is required for the initial MVP.

## Installation

The current scaffold can be loaded in Chrome for interface and manifest checks:

1. Clone or download this repository.
2. Open Chrome and go to chrome://extensions.
3. Turn on **Developer mode**.
4. Select **Load unpacked**.
5. Choose the repository root (the folder containing manifest.json).
6. Pin **Apply, Maybe, Skip** from the extensions menu.
7. Open a regular HTTP or HTTPS page and select the extension icon.

At this milestone, the popup displays a scaffold status message. A working verdict will be added in a later milestone.

## Roadmap

- [x] **Milestone 1 — Foundation:** define the MVP, architecture, extension manifest, and module scaffold.
- [ ] **Milestone 2 — Profile and rules:** add verified candidate criteria and implement deterministic screening.
- [ ] **Milestone 3 — End-to-end flow:** connect page extraction, screening, and popup states.
- [ ] **Milestone 4 — Quality:** add automated tests, fixtures, error handling, and accessibility refinements.
- [ ] **Milestone 5 — Portfolio polish:** add icons, screenshots, a demo, and release documentation.

## Privacy

The planned MVP reads visible page text only when used on a supported web page. Analysis will stay inside the extension. It will not send job-page content or candidate data to a remote service.

## License

This project is available under the [MIT License](LICENSE).
