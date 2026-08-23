# Local candidate profile workflow

This workflow keeps raw candidate documents private while making profile updates
repeatable across machines and conversations.

## What the workflow does

It provides:

- a private evidence archive for CVs, cover letters, certificates, and notes;
- a canonical human-readable profile with filename-level provenance;
- a local source index that detects new, changed, and removed documents;
- a review boundary before any new statement affects screening.

It does not automatically interpret documents or rewrite the runtime profile.

## Initial setup

1. Create a private source folder outside the Git repository.
2. Add CVs, cover letters, and other relevant documents.
3. Create a private `_candidate-profile` folder inside it.
4. Copy `docs/candidate-profile-template.md` to
   `_candidate-profile/candidate-profile.md`.
5. Copy `.candidate-profile.local.example.json` to
   `.candidate-profile.local.json` in the repository root.
6. Replace all example paths in the local config with absolute paths for your
   machine. On macOS or Linux, use the equivalent `/Users/...` or `/home/...`
   paths.

The local config must contain:

```json
{
  "sourceDirectory": "absolute path to the private archive",
  "canonicalProfile": "absolute path to candidate-profile.md",
  "indexFile": "absolute path to the private source-index.json"
}
```

The real config is excluded from Git because it contains personal filesystem
paths.

## Detect source changes

Run:

```text
npm run profile:status
```

The command compares file hashes with the last accepted index and reports:

- `New` - files not present in the accepted index;
- `Changed` - existing paths whose content hash changed;
- `Removed` - indexed files no longer present.

The command reads file bytes only to calculate SHA-256 hashes. It does not
extract document text, change the profile, or send data over the network. The
private `_candidate-profile` directory is excluded from the source scan.

## Reconcile an update

1. Review every new or changed source.
2. Distinguish candidate statements from job and company language.
3. Add supported facts to the canonical profile with their source filenames.
4. Put conflicting or isolated claims under `Needs confirmation`.
5. Update `src/profile/candidate-profile.js` only when verified facts change the
   screening rules.
6. Run `npm test`.
7. Reload the unpacked extension in Chrome and manually inspect a result.
8. Accept the reviewed source state:

```text
npm run profile:index
```

Do not run `profile:index` before reviewing reported documents: accepting the
index means the current source state has been reconciled.

## Profile formats

- **Markdown** is recommended for the canonical profile because it is easy to
  edit, compare, and audit.
- **PDF or DOCX** files can remain in the evidence archive and may provide the
  starting information.
- **JavaScript** is the runtime format currently read by the extension.

A person may export the canonical profile to PDF for personal use, but the
current extension does not parse that PDF directly.

## Privacy and Git boundaries

Keep these private and outside Git:

- raw CVs, cover letters, certificates, and notes;
- the canonical detailed profile;
- `.candidate-profile.local.json`;
- `source-index.json`;
- temporary extracted document text.

The source index contains only filenames, timestamps, sizes, and SHA-256 hashes.
Before publishing a fork, review `src/profile/candidate-profile.js`, because that
runtime file is versioned and public.

## Accuracy rules

- Prefer recent CV wording and evidence repeated across versions.
- Use cover letters as supplementary sources, not automatic truth.
- Never interpret a job description or company claim as candidate experience.
- Never invent proficiency, scope, ownership, chronology, or metrics.
- Do not merge similar numbers unless their definitions and periods are clear.
