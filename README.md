# Apply, Maybe, Skip

## A job can be wrong for your latest CV and right for your career.

Most job matchers compare one vacancy with one CV. That is convenient, but it
confuses a document with a career.

Your strongest evidence may be spread across years of tailored applications.
One CV remembers a project you had forgotten. Another explains an achievement
more clearly. A career guide may record what is confirmed, what transfers to a
new context, and what you should never overclaim.

**A useful match should compare the job with that evidence, not reward whoever
copied the most keywords into one file.**

Apply, Maybe, Skip is a Chrome extension that turns recurring evidence from your
past CVs into a private career memory. For a deeper assessment, it can also read
an Evidence Bank, Positioning Charter, Master CV, or a simple career profile.
It combines those sources with what you want next, reads the job in your active
tab, and gives you a clear first answer:

- 🟢 **Apply:** this role deserves your attention.
- 🟡 **Maybe:** there is potential, but something needs checking.
- 🔴 **Skip:** the fit is weak or the role conflicts with one of your blockers.

It does not apply for you. It does not predict whether you will be hired. It
helps answer a smaller and surprisingly expensive question:

> **Is this opportunity worth more of my time?**

Everything runs locally in Chrome. There is no account, backend, external AI,
or job-data API. The aim is not to imitate an AI recruiter. It is to make a
private, evidence-led first pass explainable and repeatable.

## The idea

Real careers contain facts, direction, uncertainty, and boundaries. They should
not all be flattened into the same keyword list.

```text
CV history  -> recurring experience signals
Evidence    -> confirmed facts and open questions
Direction   -> target, adjacent, and excluded roles
Boundaries  -> claims the candidate must not make
                         +
                 job in this tab
                         |
              Apply / Maybe / Skip
```

The extension keeps each source in its proper role. A confirmed Evidence Bank
can support a must-have. A Positioning Charter can distinguish a core lane from
an adjacent role. An open question remains a question. A profile boundary can
never become positive evidence merely because a job asks for it.

That creates a simple rule:

> **Your CVs describe what you have done. You decide where you want to go next.**

## Why it is different

| A typical job matcher | Apply, Maybe, Skip |
| --- | --- |
| Starts from one CV | Builds a source-aware career profile |
| Treats every keyword as equivalent | Separates evidence, direction, uncertainty, and boundaries |
| Returns an unexplained judgment | Shows why the role may fit and what could change the verdict |
| Often sends documents to a service | Processes everything locally |
| Tries to predict hiring | Helps prioritize your own time |

Not every useful career tool needs to guess. This one shows its work.

## Who it is for

Apply, Maybe, Skip is especially useful if you have already started applying
and accumulated a history of:

- tailored CVs;
- improved bullet points;
- projects you remembered halfway through the search;
- different descriptions of the same real experience;
- skills that appear in one application and disappear from another.

It also works with one CV or manual setup. That is the quick-start mode. Adding
a structured career profile unlocks a deeper, more cautious assessment.

Past cover letters can contain useful reminders too, but they often repeat the
language of the company or job description. The current version therefore
imports CVs only. Cover letters remain on the roadmap and will need stricter
evidence rules.

## How it works

### 1. Build a base from your CV history

Connect the folder where you keep your PDF CVs, or import individual files. The
extension reads common sections such as Skills, Core Capabilities, and Tools.
It also looks for a limited catalogue of clear experience signals in CV bullet
points and recurring role families across the documents.

It can:

- import several CVs at once;
- remember an authorized CV folder;
- check that folder automatically when profile setup opens;
- process only new or modified PDFs during later synchronizations;
- recognize duplicate files;
- reconstruct entries wrapped across PDF lines;
- combine repeated signals without counting them twice;
- suggest role directions from the CV history;
- record how many CVs support each signal.

The original PDF is not stored.

### 2. Add career intelligence when you have it

Import a Career Evidence Bank, Positioning Charter, Master CV, or the included
plain-language career profile template. PDF, DOCX, TXT, and Markdown files are
supported.

The importer keeps four different types of information separate:

- confirmed evidence that can support a job requirement;
- open questions that must remain unconfirmed;
- profile boundaries that cannot be presented as strengths;
- primary, adjacent, and excluded role directions.

Prepared documents are optional. The template in
[`docs/career-intelligence-template.md`](docs/career-intelligence-template.md)
offers a simpler starting point and does not require JSON or coding.

### 3. Add your direction

A CV can describe where you have been. It cannot reliably decide where you want
to go next.

The setup suggests role families found across your CVs. You keep, remove, or
add the directions that describe your next move. You also add the preferences
that documents cannot decide for you:

- roles you want next;
- preferred locations and working models;
- languages you speak;
- languages that would create a blocker;
- any important strength missing from the imported memory.

Possible roles, exclusions, and seniority controls are available under
Advanced settings, but they are not required for normal use.

### 4. Decide

Open a job posting and select the extension. The popup returns:

- verdict and fit score;
- up to three useful matches;
- points worth checking before applying;
- blockers that conflict with your profile.

A hard blocker, such as a mandatory language you marked as unavailable, takes
priority over the score.

The extension also looks for strongly worded experience requirements. Confirmed
career evidence can explain why one is covered. A related open question appears
under **What could change the verdict**. A matching profile boundary remains a
warning and is never converted into a strength. When no evidence is available,
the requirement is quoted for manual review.

## Install from GitHub

No coding or JSON editing is required.

1. Select the green **Code** button at the top of this page.
2. Select **Download ZIP** and unzip the file.
3. Open `chrome://extensions` in Chrome.
4. Turn on **Developer mode** in the top-right corner.
5. Select **Load unpacked**.
6. Choose the unzipped folder containing `manifest.json`.

Chrome opens the profile setup after the first installation.

This project is currently a developer preview. A future Chrome Web Store
release will remove the manual installation step.

## Try it

1. Select **Choose CV folder** and authorize the folder containing your PDFs,
   or use the individual-file importer.
2. Optionally add your career documents under **Career intelligence**.
3. Review the suggested directions and edit them if needed.
4. Add your locations and languages.
5. Select **Save my profile**.
6. Open a job posting and select the extension.

If a job page was already open when you installed or reloaded the extension,
refresh it once before analyzing it.

The connected folder is checked whenever profile setup opens. Chrome may ask
you to restore folder access after a browser restart. **Sync now** performs the
same check on demand without selecting the files again.

The repository includes an example profile for demonstration. If you do not
save your own profile, results use that example and do not represent you.

## What the score means

The verdict is the main output. The score is a secondary, deterministic
prioritization aid. It is not an ATS score, a prediction of hiring success, or
a judgment about your value as a candidate.

The engine evaluates five categories:

| Category | Maximum | What it checks |
| --- | ---: | --- |
| Role/function fit | 35 | Target, possible, and excluded roles |
| Seniority | 15 | Preferred, possible, and excluded levels |
| Location | 20 | Preferred locations and working models |
| Language | 10 | Mandatory, optional, alternative, and unavailable languages |
| Relevant strengths | 20 | Imported CV signals and optional manual strengths |

Default thresholds:

- **Apply:** 75-100 with no blocker.
- **Maybe:** 50-74, or a strong score that still needs review.
- **Skip:** below 50, or any hard blocker.

Repeated keywords do not earn extra points. Language requirements are evaluated
in context, so mandatory wording, optional skills, negations, and alternatives
such as "German or English" can produce different outcomes.

Strength matching does not require one identical sentence. The local concept
matcher normalizes word forms and looks for conservative overlap inside the
same responsibility. It can connect wording such as `stakeholder management`
with `partner with senior stakeholders`, while a generic shared word on its own
is not enough. The process remains deterministic and uses no external model.

## How job pages are read

When a page provides standard `JobPosting` data, the extension uses it to
extract the selected role's title, location, and description. On supported
LinkedIn layouts, it isolates the active job panel instead of treating nearby
search results as part of the vacancy.

Two websites can expose different facts about the same role. For example, one
may say `Berlin` while another says only `Remote`. The extension keeps that
uncertainty visible instead of inventing a missing location.

Equivalent job facts produce the same score. Different facts can produce a
different score even when both pages refer to the same vacancy.

## Privacy by design

| Information | What happens to it |
| --- | --- |
| Selected PDF CV | Read locally, then discarded after evidence extraction |
| CV source record | Filename, fingerprint, date, and extracted signals saved locally |
| Career intelligence document | Read locally, then discarded after structured evidence extraction |
| Career intelligence profile | Confirmed evidence, questions, boundaries, and directions saved locally |
| Connected folder permission | Folder handle saved locally in the extension's browser storage |
| Career memory | Saved in Chrome's local extension storage |
| Search preferences | Saved in Chrome's local extension storage |
| Active job-page text | Read and processed locally when the popup opens |
| Cover letters | Not requested or interpreted in the current version |
| ChatGPT projects or conversations | Not connected or included automatically |
| Network transmission | None in the current version |

Use **Clear CV memory** to remove imported source records and evidence. Removing
or reinstalling the extension can also remove locally stored data. Backup and
restore are planned but not available yet.

Use **Disconnect folder** to forget the folder permission without deleting the
professional memory already built from it.

## What it does not do

The extension does not:

- submit applications;
- contact employers or recruiters;
- rewrite a CV;
- read a personal LinkedIn profile;
- connect to Google Drive or another cloud account;
- send documents or job descriptions to a server;
- infer an unconfirmed language level or experience;
- perform company research or reason with the breadth of a general AI assistant;
- understand every nuance of arbitrary, unstructured career documents;
- guarantee support for every job board.

Current PDF support combines explicit skills, recurring role families, and a
conservative catalogue of experience signals. Free-form achievements,
proficiency levels, and conflicts between CV versions still require richer
evidence handling.

## Roadmap

- [x] Chrome extension and deterministic screening engine.
- [x] End-to-end popup and active-tab analysis.
- [x] Guided setup without code or JSON editing.
- [x] Structured job data and initial LinkedIn / careers fixtures.
- [x] Local multi-PDF memory with duplicate detection and automatic signals.
- [x] Suggested role directions from imported CV history.
- [x] Incremental synchronization with a user-authorized local CV folder.
- [x] Conservative concept matching for differently worded strengths.
- [x] Source-aware career intelligence with confirmed evidence, questions, and boundaries.
- [x] Local PDF, DOCX, TXT, and Markdown career-document import.
- [ ] Guided in-extension builder for people without prepared career documents.
- [ ] Richer transferable-evidence classification across industries and contexts.
- [ ] Safe, reviewed evidence from cover letters.
- [ ] Profile backup and restore.
- [ ] Additional Indeed, Greenhouse, Lever, and Workday fixtures.
- [ ] Accessibility refinements.
- [ ] Screenshots, icons, demo assets, and Chrome Web Store release.

## Advanced source archive

<details>
<summary><strong>For the repository owner and contributors</strong></summary>

The visual PDF importer is the normal user workflow. The repository also
contains an optional developer workflow for tracking a private local archive of
CVs, cover letters, certificates, and notes.

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
