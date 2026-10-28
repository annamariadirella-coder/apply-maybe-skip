# Review and coordination contract

The collector records discovery and technical verification. It is not an application ledger or proof of human review.

## One daily review owner
JOB 1 owns the final evidence review and daily digest. Other briefings contribute leads but must not reserve or suppress a vacancy merely because the collector contains it. A future private review ledger should record exact identity, JD hash, evidence/Charter revision, review status, decision, reason, timestamp and report/run identifier. An unchanged completed review may be suppressed; new evidence, changed JD, reopened requisition or changed eligibility requires reconsideration. A seen posting is never an applied posting.

## Freshness and run correlation
For the ordinary daily review, accept a valid collector snapshot only if its timestamp is not in the future and is no more than two hours old at scan start. Label it as a snapshot and report its board coverage at its own timestamp, separately from work JOB 1 performs now. It does not claim that the collector ran for this scan.

If the snapshot is missing, invalid, future dated or older than two hours, report collector output as SOURCE_UNAVAILABLE and continue independent email and employer sources without collector coverage claims.

If Anna expressly requests a newly run collector, require output created after that request and correlate it by run_id. The Apps Script writes run_id and run_started_at in candidates.json, and writes run_manifest.json last with status outputs_committed, the same ID, checked_at and completed_at, collector version, and the declared output names. Accept the manifest only when IDs/timestamps agree with candidates.json and every declared output is present. The status confirms the report files were saved; it does not claim full market coverage. Legacy reports without matching run IDs cannot establish a requested-run correlation. Do not silently substitute a scheduled snapshot for an expressly requested new run.

The offline `inspect_packet` diagnostic defaults to the stricter requested-run contract. Use `--scheduled-snapshot` for the approved two-hour daily snapshot check. Snapshot coverage is never labelled as work done by the current review. The helper never starts collection or writes state.

## Matching evidence
Read current factual sources, using Anna's direct confirmation, Evidence Bank, Charter, then Master CV. Map central requirements to exact JD text, evidence citation and confirmed scope. Preserve direct/transferable/unknown/gap distinctions, metric population, shared ownership, dates and exclusions.

Availability, professional fit and employment eligibility are separate dimensions. An HTTP error means availability unknown. An unknown fact is a question, not a confirmed gap. Check current sources and prior clarification before asking. Do not invent numerical fit thresholds or treat triage scores as interview probabilities.

## Coverage and queue visibility
Report configured, attempted, complete, incomplete, unavailable and not attempted separately. Paused boards are a subset of not attempted. Diagnostic events are not unique vacancies. Carry-over queues are not new discoveries. A 20-record packet is a work budget, not the full queue or a recommendation quota. Preserve source provenance and employer verification separately.

## Rollout and rollback
The live private Apps Script source was updated to emit this correlation contract, but no collector run was started during that rollout. Its existing trigger and processed state were preserved. The first naturally scheduled or explicitly approved run will be needed to verify that Drive contains a consistent manifest and report. Do not use a production scan as a syntax test.

GitHub changes do not install Apps Script code. Follow `docs/collector-release.md`: the public repository's workflow runs tests only, while the deployed private project includes additional private modules. Do not automate a push from this public checkout or replace the live project from it. Any further production source update requires a complete reviewed source set and recoverable backup.
