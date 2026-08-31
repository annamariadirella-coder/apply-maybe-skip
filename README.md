# Apply, Maybe, Skip

> Turn the CVs you have already written into a private professional memory for
> deciding which jobs deserve your time.

Job searching can feel like a second job. You open a role, read the same
requirements several times, compare them with different versions of your CV,
and still wonder whether applying is worth the effort. Meanwhile, useful facts
about your experience are scattered across documents created for past
applications.

**Apply, Maybe, Skip** is a Chrome extension that helps with that first
decision. It compares the job in your active tab with a private profile built
from reviewed CV evidence and your current search preferences.

It returns one of three simple answers:

- 🟢 **Apply:** the role aligns well with your profile.
- 🟡 **Maybe:** there is potential, but something needs a closer look.
- 🔴 **Skip:** the fit is weak or the role contains a blocker you configured.

This is not an AI recruiter and it cannot predict whether a company will hire
you. It is a transparent prioritization tool for deciding where to spend your
time.

Everything runs locally in Chrome. There is no account, backend, external AI,
or job-data API.

## Who this is for

This project is especially useful for people who have already started applying
and accumulated an application history: several tailored CVs, improved bullet
points, remembered projects, and different ways of describing the same real
experience.

It is a good fit if you:

- have more than one version of your CV;
- keep rediscovering useful experience while tailoring applications;
- want to reuse verified facts without maintaining one supposedly universal
  resume;
- want a quick first-pass job check without uploading personal documents to an
  external service;
- prefer visible rules and evidence over a verdict you cannot inspect.

You can still use the extension with one CV or with manual profile setup. The
professional memory simply becomes more useful as you review more sources.

Past cover letters can also contain valuable reminders, but they often repeat
language from a company or job description. For that reason, the current
version imports PDF CVs only. Reviewed cover-letter evidence is part of the
roadmap, but it will never be accepted as candidate experience automatically.

## A profile that can grow with your CVs

Most people do not have one universal CV. They adapt it for each application,
remember an old project, rewrite a result, or add a skill that was relevant to a
particular role.

This extension treats every CV as a source, not as automatic truth:

```text
Several PDF CVs
        ↓ read locally
Possible skills with source history
        ↓ approved or rejected by you
Professional memory
        +
Current role, location, and language preferences
        ↓
Apply / Maybe / Skip
```

The current PDF importer:

- accepts several CVs at once;
- recognizes duplicate files;
- reads common sections such as Skills, Core Capabilities, and Tools;
- reconstructs entries that wrap across PDF lines;
- records how many CVs support each suggestion;
- requires your approval before a suggestion can affect screening.

The original PDFs are not stored. The extension keeps only the filename, file
fingerprint, date, and reviewed evidence in Chrome's local storage.

PDF support currently focuses on skills and tools. It does not yet reconstruct
your complete employment history or automatically accept job titles,
achievements, languages, and proficiency levels.

## Install from GitHub

You do not need to write code or edit a JSON file.

1. Select the green **Code** button at the top of this GitHub page.
2. Select **Download ZIP** and unzip the downloaded file.
3. Open `chrome://extensions` in Chrome.
4. Turn on **Developer mode** in the top-right corner.
5. Select **Load unpacked**.
6. Choose the unzipped folder that contains `manifest.json`.

Chrome opens the profile setup page after the first installation.

This project is currently a developer preview. A future Chrome Web Store
release will remove the manual installation step.

## Set up your profile

### 1. Import CV evidence

Select one or more PDF CVs and choose **Import selected CVs**. Importing a file
does not automatically add everything it contains to your profile.

Review the suggestions and approve only the skills that describe your real
experience. Rejected and pending suggestions do not affect job results.

You can import newer CVs later. Existing files are recognized as duplicates and
can be rechecked when the extraction rules improve.

### 2. Add what you want next

Complete the preferences that a CV usually cannot answer:

- strong target roles;
- preferred locations and working models;
- languages you speak;
- languages you do not speak;
- any important strength that was not found in the imported CVs.

Possible roles, roles to avoid, and seniority preferences are available under
**Optional fine-tuning**.

Choose **Save my profile** when you are ready. You can return at any time by
selecting **Set up / edit profile** in the popup.

### 3. Check a job

1. Pin **Apply, Maybe, Skip** from Chrome's extensions menu.
2. Open a job posting.
3. Select the extension.

If the page was already open when you installed or reloaded the extension,
refresh the page once before analyzing it.

The repository contains an example profile for demonstration. If you do not
save your own profile, results use that example and do not represent you.

## What the popup shows

The popup deliberately keeps the result short:

- verdict and fit score;
- up to three useful matches;
- concrete points to check before applying;
- blockers that conflict with your profile.

A hard blocker, such as a mandatory language you marked as unavailable, takes
priority over the score.

The score is a deterministic prioritization aid. It is not an ATS score, a
prediction of hiring success, or a judgment about your value as a candidate.

The extension does not submit applications, contact employers, rewrite your
CV, or send a job posting elsewhere.

## How job pages are read

When a page provides standard `JobPosting` data, the extension uses it to
extract the selected role's title, location, and description. On supported
LinkedIn layouts it isolates the active job panel instead of treating nearby
search results as part of the same vacancy.

If two websites describe the same role differently, the extension does not
invent the missing information. For example, `Remote` without an eligible
country remains something to check, while `Berlin` can match an explicit Berlin
preference.

Equivalent job facts produce the same score. Different facts can produce a
different score even when both pages refer to the same vacancy.

## Your data stays yours

| Information | What happens to it |
| --- | --- |
| Selected PDF CV | Read locally, then discarded after evidence extraction |
| CV source record | Filename, fingerprint, date, and evidence saved locally |
| Approved professional memory | Saved in Chrome's local extension storage |
| Search preferences | Saved in Chrome's local extension storage |
| Active job-page text | Read and processed locally when you open the popup |
| Cover letters | Not requested or interpreted during normal setup |
| ChatGPT projects or conversations | Not connected or included automatically |
| Network transmission | None in the current version |

You can remove the imported source records and evidence with **Clear CV
memory**. Removing or reinstalling the extension can also remove locally stored
data. Profile backup and restore are planned but not available yet.

## Screening model

The screening engine scores five categories:

| Category | Maximum | What it checks |
| --- | ---: | --- |
| Role/function fit | 35 | Target, possible, and excluded roles |
| Seniority | 15 | Preferred, possible, and excluded levels |
| Location | 20 | Preferred locations and working models |
| Language | 10 | Mandatory, optional, alternative, and unavailable languages |
| Relevant strengths | 20 | Manual strengths and approved CV evidence |

Default thresholds:

- **Apply:** 75-100 with no blocker.
- **Maybe:** 50-74, or a strong score that still needs review.
- **Skip:** below 50, or any hard blocker.

Repeated keywords do not earn extra points. The language detector evaluates
context and can distinguish mandatory wording, optional skills, negations, and
alternatives such as "German or English".

## What is included today

- guided profile and preference setup;
- local multi-PDF professional memory;
- duplicate detection and source provenance;
- approval and rejection of suggested evidence;
- local browser storage and memory deletion;
- structured job-page extraction;
- initial LinkedIn and company-careers support;
- deterministic scoring with matches, checks, and blockers;
- contextual language-requirement detection;
- unsupported-page and error handling;
- automated tests.

The extension does not currently include automatic applications, cloud
accounts, external AI, DOCX or cover-letter interpretation, complete career
history reconstruction, guaranteed support for every job board, profile backup,
or Chrome Web Store distribution.

## Roadmap

- [x] Chrome extension and deterministic screening engine.
- [x] End-to-end popup and active-tab analysis.
- [x] Guided setup without code or JSON editing.
- [x] Structured job data and initial LinkedIn / careers fixtures.
- [x] Local PDF CV memory with duplicate detection and reviewed skills.
- [ ] Evidence for past roles, achievements, tools, and conflicts between CVs.
- [ ] Profile backup and restore.
- [ ] Additional Indeed, Greenhouse, Lever, and Workday fixtures.
- [ ] Accessibility refinements.
- [ ] Screenshots, icons, demo assets, and Chrome Web Store release.

## Advanced source archive

<details>
<summary><strong>For the repository owner and contributors</strong></summary>

The visual PDF importer is the normal user workflow. The repository also
contains an optional developer workflow for tracking changes in a private local
archive of CVs, cover letters, certificates, and notes.

Only reviewed screening rules committed to this repository are public. Private
folders, Drive files, CV documents, and ChatGPT conversations are not included
and are not available to people who install the extension.

Useful references:

- [`docs/candidate-profile-template.md`](docs/candidate-profile-template.md)
- [`docs/candidate-profile-workflow.md`](docs/candidate-profile-workflow.md)
- [`.candidate-profile.local.example.json`](.candidate-profile.local.example.json)

The example JSON belongs only to this optional developer workflow. It is not
needed to install or use the extension.

```text
npm run profile:status   Detect changed local profile sources
npm run profile:index    Accept a reviewed source state
npm test                 Run all automated tests
```

</details>

## For contributors

The extension uses Chrome Manifest V3 and has no build step. PDF.js is bundled
locally under its open-source license. Node.js is needed only for automated
tests, dependency maintenance, and the optional source-archive workflow.

```text
apply-maybe-skip/
├── manifest.json
├── src/
│   ├── background/
│   ├── content/
│   ├── options/
│   ├── popup/
│   ├── profile/
│   └── screening/
├── vendor/pdfjs/
├── scripts/
├── docs/
├── tests/
├── package.json
└── README.md
```

Run the complete test suite with:

```text
npm test
```

## License

This project is available under the [MIT License](LICENSE). PDF.js retains its
own license in [`vendor/pdfjs/LICENSE`](vendor/pdfjs/LICENSE).
