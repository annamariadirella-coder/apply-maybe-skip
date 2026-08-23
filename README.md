# Apply, Maybe, Skip

A local, explainable Chrome extension that compares the job posting in your
active tab with a candidate profile and returns one quick verdict:

- 🟢 **Apply** - strong alignment with the configured profile.
- 🟡 **Maybe** - meaningful potential, but something needs review.
- 🔴 **Skip** - weak alignment or a configured hard blocker.

The popup also shows a score, a short explanation, strongest matches, key gaps,
and blockers. Analysis runs inside the extension: no account, backend, external
AI service, or third-party job-data API is required.

> **Development status:** Milestone 3 is complete. Active-tab extraction,
> deterministic screening, explainable popup results, error states, automated
> tests, and a source-backed local profile workflow are implemented.

## Read this before installing

This repository includes the author's candidate profile as a working example.
If you load the extension without changing it, jobs will be screened against
**Annamaria's** target roles, location preferences, verified strengths,
languages, and blockers - not yours.

The extension becomes useful for another person only after
[`src/profile/candidate-profile.js`](src/profile/candidate-profile.js) has been
personalized. You can build that profile directly, or ground it in a private
folder containing your CVs, cover letters, and supporting documents.

## Quick start

1. Clone or download this repository.
2. Open `chrome://extensions` in Chrome.
3. Turn on **Developer mode**.
4. Select **Load unpacked**.
5. Choose the repository root - the folder containing `manifest.json`.
6. Pin **Apply, Maybe, Skip** from Chrome's extensions menu.
7. Open a job posting on a normal HTTP or HTTPS page and select the extension.

The popup analyzes the active tab automatically. If the job page was already
open when the extension was installed or reloaded, refresh that page once so
Chrome can inject the content script.

## What the extension does

When you open the popup, the extension:

1. reads the visible text and title of the active job page;
2. builds a normalized `jobPage` object;
3. loads the configured candidate profile;
4. runs a deterministic screening engine;
5. renders the verdict and the reasons behind it.

It does not submit applications, rewrite CVs, contact employers, or send job
page content elsewhere.

## How the candidate profile works

There are three separate layers:

```text
Private evidence
CVs, cover letters, certificates, notes
        ↓ reviewed and consolidated
Canonical candidate profile
Human-readable facts, goals, evidence, and unresolved questions
        ↓ translated into screening rules
Runtime profile
src/profile/candidate-profile.js
        ↓
Apply / Maybe / Skip
```

| Layer | Purpose | Where it lives |
| --- | --- | --- |
| Evidence archive | Preserves the documents supporting candidate facts | A private folder outside Git |
| Canonical profile | Records verified experience, goals, skills, preferences, and source filenames | Markdown is recommended; PDF is optional for human use |
| Runtime profile | Contains the structured rules the extension can evaluate | `src/profile/candidate-profile.js` |

The extension reads the runtime JavaScript profile. It does **not** currently
understand a PDF or a folder of documents by itself.

### Option A - configure the profile directly

Edit [`src/profile/candidate-profile.js`](src/profile/candidate-profile.js) and
replace the example values for:

- strong, potential, and usually-skip role families;
- preferred and excluded seniority levels;
- location and working-model preferences;
- verified and unavailable languages;
- relevant strength signals and their keyword patterns;
- Apply and Maybe score thresholds.

Do not add a skill, job title, proficiency level, or result unless it is true.
After editing, run `npm test` and reload the extension in Chrome.

### Option B - build the profile from a private local archive

This is the recommended workflow when your experience evolves across several CV
and cover-letter versions.

1. Create a private folder outside the repository and place your source
   documents there. PDF, DOCX, text, images, and other supporting files may be
   kept together.
2. Copy
   [`.candidate-profile.local.example.json`](.candidate-profile.local.example.json)
   to `.candidate-profile.local.json` and replace the example paths with your
   own.
3. Copy
   [`docs/candidate-profile-template.md`](docs/candidate-profile-template.md)
   into the private folder and use it as your canonical profile.
4. Run `npm run profile:status` to detect new, changed, or removed source files.
5. Review reported documents, update the canonical profile with filename-level
   provenance, and then update the runtime screening rules.
6. Run `npm test`.
7. Run `npm run profile:index` only after the changes have been reviewed.

The local index stores filenames, modification times, sizes, and SHA-256 hashes.
It does not store extracted CV or cover-letter text and it is not committed to
Git.

Full instructions are in
[`docs/candidate-profile-workflow.md`](docs/candidate-profile-workflow.md).

### Is the folder automatically imported?

Not yet. The current local workflow automatically detects which documents are
new or changed, but a human or development assistant must still decide which
statements are candidate facts. This review matters because a cover letter can
contain company descriptions, job requirements, or tailored wording that should
not become a claimed skill.

Automatic local document parsing with a review screen is a possible future
feature. Until then, source detection is automatic and profile interpretation is
deliberately reviewed.

### Can I use one profile PDF?

Yes - one carefully maintained profile PDF can be part of the private evidence
archive or serve as a human-readable summary. However, the extension does not
currently screen directly from that PDF. Its verified content still needs to be
represented in `candidate-profile.js`.

Markdown is recommended for the canonical profile because it is easy to update,
compare, and trace back to source filenames. A PDF can be exported from it for
personal use without becoming the runtime data format.

## The example profile in this repository

The current example demonstrates a source-backed approach:

- the private archive contains many tailored CVs, cover letters, and supporting
  documents;
- repeated evidence and the most recent wording form the baseline;
- isolated or conflicting claims remain marked for confirmation;
- only distilled screening rules are committed to this repository;
- raw documents, extracted text, personal filesystem paths, and the detailed
  canonical profile stay private.

This design lets the public repository demonstrate how the system works without
publishing the underlying application archive.

## Screening model

The engine scores five independent categories. Repeated keywords do not earn
extra points; each configured signal can match only once.

| Category | Maximum | What it evaluates |
| --- | ---: | --- |
| Role/function fit | 35 | Strong, contextual, or excluded role families |
| Seniority | 15 | Preferred, potential, or excluded levels |
| Location | 20 | Preferred locations, remote/hybrid rules, relocation and onsite blockers |
| Language | 10 | Contextual mandatory, optional, alternative, and unavailable-language requirements |
| Relevant strengths | 20 | Distinct, profile-backed competency groups |

Default thresholds:

- **Apply:** 75-100, with no blocker requiring review or rejection.
- **Maybe:** 50-74, or an otherwise-Apply result with a review blocker.
- **Skip:** below 50, or any hard blocker regardless of score.

Hard blockers override the weighted score. Their exact meaning comes from the
candidate profile: for one user a language or relocation requirement may be a
blocker; for another it may be a match.

The screening function returns:

- `verdict`
- `score`
- `explanation`
- `strongestMatches`
- `keyGaps`
- `blockers`
- `scoreBreakdown`

## Architecture

```text
Active job tab
    ↓
Content script: src/content/job-page-extractor.js
    ↓
Popup controller: src/popup/popup.js
    ↓
Candidate profile + screening engine
    ↓
Verdict, score, explanation, matches, gaps, blockers
```

The screening engine is browser-independent. It accepts a plain object with a
title, optional location, page text, and optional URL, which keeps the rules
easy to test without Chrome.

## Privacy

| Data | Behavior |
| --- | --- |
| Active job-page text | Read only when the popup is used; processed locally |
| Candidate runtime profile | Bundled locally with the unpacked extension |
| CV and cover-letter archive | Remains in the user-selected private folder |
| Local source configuration | Excluded from Git |
| Source index | Private; contains metadata and hashes, not extracted text |
| Network transmission | None in the current MVP |

If you publish a fork, review `candidate-profile.js` first: that file is tracked
by Git and should contain only information you are comfortable making public.

## Current scope and limitations

Included:

- Chrome Manifest V3 extension;
- visible page-text extraction;
- deterministic and explainable scoring;
- contextual language-requirement detection without external AI;
- profile-specific blockers and preferences;
- compact Apply/Maybe/Skip popup;
- unsupported-page and missing-content handling;
- automated screening and popup-flow tests;
- local source-change detection for profile maintenance.

Not included:

- automatic applications;
- user accounts or cloud synchronization;
- external AI or third-party job APIs;
- automatic PDF or DOCX profile interpretation;
- guaranteed parsing for every job board;
- automatic resume rewriting.

## Project structure

```text
apply-maybe-skip/
├── AGENTS.md
├── manifest.json
├── src/
│   ├── content/job-page-extractor.js
│   ├── profile/candidate-profile.js
│   ├── screening/screen-job.js
│   └── popup/
│       ├── analyze-job.js
│       ├── popup.html
│       ├── popup.css
│       └── popup.js
├── scripts/profile-sources.mjs
├── docs/
│   ├── candidate-profile-template.md
│   └── candidate-profile-workflow.md
├── tests/
│   ├── popup-flow.test.js
│   └── screen-job.test.js
├── package.json
└── README.md
```

## Development commands

```text
npm test                 Run all automated tests
npm run profile:status   Detect changed local profile sources
npm run profile:index    Accept the reviewed source state
```

No build step or external runtime service is required for the extension MVP.
Node.js is needed only to run automated tests and the optional local profile
maintenance commands; it is not required simply to load the unpacked extension.

## Roadmap

- [x] **Milestone 1 - Foundation:** MVP, architecture, manifest, and scaffold.
- [x] **Milestone 2 - Profile and rules:** verified profile and deterministic
  screening.
- [x] **Milestone 3 - End-to-end flow:** extraction, screening, popup states,
  and persistent local profile workflow.
- [ ] **Milestone 4 - Quality:** broader fixtures, accessibility refinements,
  and job-board resilience.
- [ ] **Milestone 5 - Portfolio polish:** icons, screenshots, demo, and release
  documentation.
- [ ] **Future exploration:** guided local profile import with explicit review
  before any candidate fact affects scoring.

## License

This project is available under the [MIT License](LICENSE).
