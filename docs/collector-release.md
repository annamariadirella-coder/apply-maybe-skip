# Collector release and Apps Script installation

## Why a GitHub merge does not install Apps Script

The repository workflow in `.github/workflows/test.yml` runs automated tests; it does not authenticate to Google or deploy an Apps Script project. A merge changes GitHub only. The collector README's manual copy instructions are for the public source set.

The live private project has additional modules and operational state not represented by this public repository. Pushing the public checkout wholesale (including a clasp deployment) could remove private behavior or change the production project. Do not add unattended deployment credentials or a push workflow to this repository.

## Current run-correlation release

The run-correlation patch adds `run_id` and `run_started_at` to each report and writes `run_manifest.json` after the three declared outputs. The manifest's `outputs_committed` status means those output writes completed; it does not mean the scan covered every source or board. The existing live Apps Script source was separately updated and saved in its editor. No scan, trigger change, Drive state change or Tracker update was part of that source save.

The first scheduled run after installation can verify the contract using read-only inspection: compare the report and manifest run IDs and timestamps, confirm the declared files exist, and read coverage/errors independently. Do not launch a production scan just to test syntax.

## Safe release process for later changes

1. Review and test the canonical source and generated test mirror. Run the repository test workflow.
2. Export and preserve a recoverable copy of the complete private Apps Script source set. Keep private configuration, Script Properties, Drive folder, queue state and Tracker data out of Git.
3. Compare every module in the private installation with the proposed change. Port the reviewed patch into that complete source set; never replace the private project with this public base.
4. Save the source in the existing Apps Script project and verify the editor reports it saved. Do not run setup helpers or change the trigger unless the change explicitly requires it and Anna approves.
5. For behavior changes, wait for an already scheduled run or obtain separate approval for a manual production run. Verify outputs read-only and roll back from the preserved source copy if needed.

There is currently no safe automatic deployment path from this repository. A future deployment system would require a complete versioned private source bundle, explicit environment boundaries, protected credentials, review gates and a documented rollback before it could replace the manual release.
