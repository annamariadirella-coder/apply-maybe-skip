# Local candidate profile workflow

The extension keeps candidate data local. Raw CVs, cover letters, and supporting
documents live outside the repository in a user-selected folder. A local config
file points the project to that folder and is excluded from Git.

## Check for new material

Run:

    npm run profile:status

The command compares file hashes with the last accepted source index and reports
new, changed, and removed documents. It does not read document content, change
the profile, or send data over the network.

## Reconcile an update

1. Review every reported source.
2. Add supported candidate facts to the canonical local profile with the source
   filename.
3. Put conflicting or isolated claims under `Needs confirmation`.
4. Update `src/profile/candidate-profile.js` only when the verified information
   changes the screening rules.
5. Run `npm test`.
6. Accept the reviewed source state with `npm run profile:index`.

The source index contains filenames, timestamps, sizes, and SHA-256 hashes. It
does not contain extracted CV or cover-letter text.

## Safety rules

- Never interpret a job description or company claim in a cover letter as a
  candidate fact.
- Prefer the latest CV wording and facts repeated across multiple versions.
- Do not invent proficiency, scope, ownership, or metrics.
- Keep raw documents, the canonical detailed profile, local paths, and the
  source index out of Git.
