# Apply, Maybe, Skip

A private Chrome extension that reads the job posting in your active tab,
compares it with your profile, and gives you one quick answer:

- 🟢 **Apply** — strong match.
- 🟡 **Maybe** — worth a closer look.
- 🔴 **Skip** — weak match or a non-negotiable requirement.

The popup shows only the useful details: score, top matches, concrete gaps, and
real blockers. Everything runs locally in Chrome. There is no account, backend,
external AI service, or third-party job-data API.

## Try it in five minutes

No coding or JSON editing is required for the normal setup.

### 1. Download the extension

1. Select the green **Code** button at the top of this GitHub page.
2. Select **Download ZIP**.
3. Unzip the downloaded file.

### 2. Add it to Chrome

1. Open `chrome://extensions`.
2. Turn on **Developer mode** in the top-right corner.
3. Select **Load unpacked**.
4. Choose the unzipped folder containing `manifest.json`.

Chrome will open the profile setup page automatically.

### 3. Set up your profile

Fill in simple fields for:

- target and excluded roles;
- preferred seniority;
- locations or remote-working preferences;
- languages you speak and languages you do not speak;
- your strongest skills.

Use one item per line and select **Save my profile**. The information is stored
privately in your browser. You can change it at any time by selecting
**Set up / edit profile** in the popup.

### 4. Check a job

1. Pin **Apply, Maybe, Skip** from Chrome's extensions menu.
2. Open a job posting on a normal website.
3. Select the extension.

If the job page was already open when the extension was installed or reloaded,
refresh that page once before opening the popup.

> **Important:** this repository contains the repository owner's example
> profile so the project works immediately as a demo. If you skip profile
> setup, results will use that example rather than your information.

## What happens when you open the popup?

```text
Active job page
      ↓
Visible title and job text
      ↓
Your locally saved profile
      ↓
Deterministic screening rules
      ↓
Apply / Maybe / Skip
```

The extension checks role fit, seniority, location, mandatory languages, and
profile-backed strengths. A hard blocker—such as a mandatory language you do
not speak—overrides the numerical score.

It does not submit applications, contact employers, rewrite your CV, or send
job-page text elsewhere.

## Your profile and privacy

| Information | What happens to it |
| --- | --- |
| Profile entered in setup | Saved in Chrome's local extension storage |
| Active job-page text | Read when you open the popup and processed locally |
| CVs and cover letters | Not requested or uploaded during normal setup |
| Network transmission | None in the current version |

The profile setup is deliberately simple. It creates screening preferences; it
does not claim experience that you did not enter, and it does not infer
proficiency levels.

## Current installation status

This repository is currently a developer preview, so GitHub users install it
with Chrome's **Load unpacked** flow. A future Chrome Web Store release is the
path to a normal one-click installation and automatic updates.

## Advanced: build a profile from CVs and cover letters

Most users can stop here. The workflow below is optional and intended for the
repository owner, contributors, or people who want an auditable profile archive.

<details>
<summary><strong>Open the source-backed profile workflow</strong></summary>

The advanced workflow separates three layers:

```text
Private evidence folder
CVs, cover letters, certificates, notes
        ↓ reviewed and consolidated
Canonical candidate profile
Human-readable facts with source filenames
        ↓ translated into screening rules
Runtime profile or visual setup
        ↓
Apply / Maybe / Skip
```

The repository includes:

- [`docs/candidate-profile-template.md`](docs/candidate-profile-template.md), a
  human-readable profile template;
- [`docs/candidate-profile-workflow.md`](docs/candidate-profile-workflow.md),
  the complete maintenance instructions;
- [`.candidate-profile.local.example.json`](.candidate-profile.local.example.json),
  an example configuration for source-change detection.

The JSON file is **not required to install or use the extension**. It is only
for the optional developer workflow that detects new, changed, or removed files
inside a private CV archive.

The extension does not automatically interpret a PDF, DOCX, or folder of
documents. A person or development assistant must review source documents
before new statements become candidate facts. This prevents tailored job or
company wording from being mistaken for real experience.

Advanced maintenance commands:

```text
npm run profile:status   Detect changed local profile sources
npm run profile:index    Accept a reviewed source state
npm test                 Run all automated tests
```

</details>

## How screening works

The engine scores five independent categories. Repeated keywords do not earn
extra points, and hard blockers remain separate from the weighted score.

| Category | Maximum | What it evaluates |
| --- | ---: | --- |
| Role/function fit | 35 | Target, possible, and excluded role families |
| Seniority | 15 | Preferred, possible, and excluded levels |
| Location | 20 | Preferred locations and working models |
| Language | 10 | Mandatory, optional, alternative, and unavailable languages |
| Relevant strengths | 20 | Distinct skills configured in the profile |

Default thresholds:

- **Apply:** 75–100 with no blocker.
- **Maybe:** 50–74, or a strong score that still needs review.
- **Skip:** below 50, or any hard blocker.

The language detector evaluates requirement context rather than relying on one
exact sentence. It distinguishes mandatory wording, optional skills, negations,
and alternatives such as “German or English”.

## Project structure

```text
apply-maybe-skip/
├── manifest.json
├── src/
│   ├── background/on-installed.js
│   ├── content/job-page-extractor.js
│   ├── options/
│   │   ├── options.html
│   │   ├── options.css
│   │   └── options.js
│   ├── profile/
│   │   ├── candidate-profile.js
│   │   └── profile-settings.js
│   ├── screening/screen-job.js
│   └── popup/
│       ├── analyze-job.js
│       ├── popup.html
│       ├── popup.css
│       └── popup.js
├── scripts/profile-sources.mjs
├── docs/
├── tests/
├── package.json
└── README.md
```

The extension uses Chrome Manifest V3 and has no build step. Node.js is needed
only for automated tests and optional profile-source maintenance—not for normal
use in Chrome.

## Current scope

Included:

- guided profile setup with local browser storage;
- automatic setup page on first installation;
- active-tab job extraction;
- deterministic and explainable scoring;
- contextual language-requirement detection;
- concise Apply/Maybe/Skip popup;
- unsupported-page and error handling;
- automated tests;
- optional source-backed profile maintenance.

Not included:

- automatic job applications;
- cloud accounts or synchronization;
- external AI or third-party job APIs;
- automatic PDF or DOCX interpretation;
- guaranteed parsing for every job board;
- Chrome Web Store distribution yet.

## Roadmap

- [x] Foundation and Chrome extension scaffold.
- [x] Candidate profile and deterministic screening rules.
- [x] End-to-end popup flow and local profile archive workflow.
- [x] Guided, no-code profile setup.
- [ ] Broader job-board fixtures and accessibility refinements.
- [ ] Screenshots, demo assets, icons, and Chrome Web Store release.

## License

This project is available under the [MIT License](LICENSE).
