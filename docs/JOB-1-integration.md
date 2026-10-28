# JOB 1 integration checklist

JOB 1 runs outside this repository. Keep its prompt concise and point it to the repository's `AGENTS.md`, the job1-review procedure, and the current knowledge pages. Verify the task can actually read the selected branch and those files before relying on the links; a repository path in a prompt does not guarantee files are mounted.

The approved collector snapshot rule is in `docs/knowledge/job-search-system.md`. Update the existing JOB 1 task in place. Preserve its current source search, reporting, privacy and application controls. Do not create a duplicate scheduled task.

When the task has saved its changes, reopen its actual instructions and compare the freshness section against that decision. Record the task identifier and verification time in a private operational note, not in public Git history.

A new collector run contract remains distinct and needs a production run_id before JOB 1 can prove correlation. Do not imply deployment or run correlation exists until checked in the live installation.
