# JOB 1 integration checklist

JOB 1 runs outside this repository. Keep its prompt concise and point it to the repository's `AGENTS.md`, the job1-review procedure, and the current knowledge pages. Verify the task can actually read the selected branch and those files before relying on the links; a repository path in a prompt does not guarantee files are mounted.

The approved collector snapshot rule is in `docs/knowledge/job-search-system.md`. Update the existing JOB 1 task in place. Preserve its current source search, reporting, privacy and application controls. Do not create a duplicate scheduled task.

After saving, reopen the actual task instructions and compare the freshness section against the approved rule. Treat only readable, exact saved text as confirmation. An opaque content reference, a “done” reply, or a repository note is not proof that the prompt changed. If the task UI or tool cannot read back its instructions, mark persistence UNVERIFIED and tell Anna exactly where she needs to paste or confirm the text. Never claim the prompt was saved without that verification.

Record the task identifier and verification time in a private operational note, not in public Git history. Use `docs/collector-release.md` for the independent Apps Script release path. JOB 1 freshness instructions do not deploy collector code or start a scan.
