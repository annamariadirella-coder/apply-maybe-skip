# Apply, Maybe, Skip

Job searching can feel like a second job. I built this extension because I was
tired of opening a role, reading the same requirements three times, and still
wondering whether it was worth applying.

**Apply, Maybe, Skip** gives you a quick first pass. It reads the job posting in
your active Chrome tab, compares it with the profile you set up, and gives you
one of three answers:

- 🟢 **Apply:** your profile lines up well with the role.
- 🟡 **Maybe:** there is potential, but something deserves a closer look.
- 🔴 **Skip:** the match is weak or the job contains a configured blocker.

This is not an AI recruiter and it cannot predict whether a company will hire
you. It is a private decision aid designed to help you spend your time on the
roles that look most promising.

Everything runs locally in Chrome. There is no account, backend, external AI
service, or third-party job-data API.

## Get started in a few minutes

You do not need to write code or edit a JSON file.

### 1. Download the extension

1. Select the green **Code** button at the top of this GitHub page.
2. Select **Download ZIP**.
3. Unzip the downloaded file.

### 2. Add it to Chrome

1. Open `chrome://extensions`.
2. Turn on **Developer mode** in the top-right corner.
3. Select **Load unpacked**.
4. Choose the unzipped folder that contains `manifest.json`.

Chrome opens the profile setup page when the extension is installed for the
first time.

### 3. Tell the extension what matters to you

The setup asks for three things:

1. the roles you are looking for;
2. your location preferences and languages;
3. the skills you want the extension to look for.

Use one item per line and select **Save my profile**. Your answers stay in your
browser. You can change them later by selecting **Set up / edit profile** in the
popup.

Possible roles, roles to avoid, and seniority preferences are available under
**Optional fine-tuning**. You can ignore that section when you first try the
extension.

### 4. Check a job

1. Pin **Apply, Maybe, Skip** from Chrome's extensions menu.
2. Open a job posting on a normal website.
3. Select the extension.

If the page was already open when you installed or reloaded the extension,
refresh it once before opening the popup.

> **One important thing:** the repository includes the repository owner's
> example profile so the extension can work as a demo. If you skip the setup,
> the result will use that example instead of your information.

## What you will see

The popup keeps the result short:

- a verdict and fit score;
- up to three useful matches;
- concrete points to check;
- blockers that conflict with your profile.

A hard blocker, such as a mandatory language you do not speak, takes priority
over the score.

The score is a deterministic prioritization aid. It is not a prediction of
hiring success, an ATS score, or a judgment about your value as a candidate.

The extension does not submit applications, contact employers, rewrite your
CV, or send the job posting elsewhere.

## How it works

```text
Job page in your active tab
        ↓
Visible title and job text
        ↓
Profile saved in your browser
        ↓
Clear, deterministic screening rules
        ↓
Apply / Maybe / Skip
```

The rules look at role fit, seniority, location, mandatory languages, and the
strengths you added to your profile. Repeated keywords do not earn extra points.

When a page provides standard `JobPosting` data, the extension uses it to keep
the title, location, and description focused on the selected role. On supported
job-board layouts, it reads the selected job panel instead of surrounding search
results. If two sources describe the same role differently, the popup keeps that
uncertainty visible rather than inventing a missing location or requirement.

## Your data stays yours

| Information | What happens to it |
| --- | --- |
| Profile entered in setup | Saved in Chrome's local extension storage |
| Active job-page text | Read when you open the popup and processed locally |
| CVs and cover letters | Not requested or uploaded during normal setup |
| ChatGPT projects or conversations | Not connected to the extension or included automatically |
| Network transmission | None in the current version |

The setup creates screening preferences from the information you enter. It does
not invent experience or infer proficiency levels.

## Installation status

This project is currently a developer preview. GitHub users install it with
Chrome's **Load unpacked** flow. A future Chrome Web Store release will make
installation and updates simpler.

## Advanced profile workflow

Most people can stop here. The workflow below is for the repository owner,
contributors, and anyone who wants to maintain a traceable profile based on a
private archive of CVs and cover letters.

<details>
<summary><strong>Open the advanced workflow</strong></summary>

The repository owner's example profile was not created from memory alone. It is
grounded in a private folder containing past CVs, cover letters, certificates,
and notes.

Only the reviewed screening rules committed to this repository are public. The
private source folder, Drive files, and ChatGPT conversations are not included
and are not available to people who install the extension.

That workflow separates the source documents from the facts used for screening:

```text
Private evidence folder
CVs, cover letters, certificates, notes
        ↓ reviewed and consolidated
Canonical candidate profile
Facts, goals, evidence, and source filenames
        ↓ translated into screening rules
Runtime profile or visual setup
        ↓
Apply / Maybe / Skip
```

The repository includes:

- [`docs/candidate-profile-template.md`](docs/candidate-profile-template.md), a
  template for the human-readable profile;
- [`docs/candidate-profile-workflow.md`](docs/candidate-profile-workflow.md),
  the complete maintenance guide;
- [`.candidate-profile.local.example.json`](.candidate-profile.local.example.json),
  an example configuration for detecting source changes.

The JSON file is not needed to install or use the extension. It belongs only to
the optional developer workflow that tracks new, changed, or removed files in a
private archive.

The extension does not automatically interpret a PDF, DOCX, or folder of
documents. Someone still needs to review the sources before a new statement
becomes part of the profile. This matters because a tailored cover letter often
contains language from the company or job description, not only facts about the
candidate.

Advanced maintenance commands:

```text
npm run profile:status   Detect changed local profile sources
npm run profile:index    Accept a reviewed source state
npm test                 Run all automated tests
```

</details>

## Screening model

The engine scores five categories:

| Category | Maximum | What it checks |
| --- | ---: | --- |
| Role/function fit | 35 | Target, possible, and excluded roles |
| Seniority | 15 | Preferred, possible, and excluded levels |
| Location | 20 | Preferred locations and working models |
| Language | 10 | Mandatory, optional, alternative, and unavailable languages |
| Relevant strengths | 20 | Distinct skills configured in the profile |

Default thresholds:

- **Apply:** 75-100 with no blocker.
- **Maybe:** 50-74, or a strong score that still needs review.
- **Skip:** below 50, or any hard blocker.

The language detector looks at context rather than one exact sentence. It can
distinguish mandatory wording, optional skills, negations, and alternatives
such as "German or English".

## For contributors

The extension uses Chrome Manifest V3 and has no build step. Node.js is needed
only for automated tests and the optional source-maintenance workflow. It is not
needed for normal use in Chrome.

```text
apply-maybe-skip/
├── manifest.json
├── src/
│   ├── background/on-installed.js
│   ├── content/job-page-extractor.js
│   ├── options/
│   ├── profile/
│   ├── screening/screen-job.js
│   └── popup/
├── scripts/profile-sources.mjs
├── docs/
├── tests/
├── package.json
└── README.md
```

Run the complete test suite with:

```text
npm test
```

## What is included today

- guided profile setup with local browser storage;
- automatic setup page on first installation;
- active-tab job extraction;
- structured `JobPosting` extraction and an isolated LinkedIn job panel;
- deterministic scoring with visible matches, gaps, and blockers;
- contextual language-requirement detection;
- a concise Apply/Maybe/Skip popup;
- unsupported-page and error handling;
- automated tests;
- an optional source-backed profile workflow.

The extension does not currently include automatic applications, cloud
accounts, external AI, automatic PDF or DOCX interpretation, guaranteed support
for every job board, or Chrome Web Store distribution.

## Roadmap

- [x] Foundation and Chrome extension scaffold.
- [x] Candidate profile and deterministic screening rules.
- [x] End-to-end popup flow and local profile archive workflow.
- [x] Guided profile setup that does not require code.
- [x] Structured job data and initial LinkedIn / company-careers fixtures.
- [ ] Additional Indeed, Greenhouse, Lever, and Workday fixtures.
- [ ] Accessibility refinements.
- [ ] Screenshots, demo assets, icons, and Chrome Web Store release.

## License

This project is available under the [MIT License](LICENSE).
