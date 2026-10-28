# Review and coordination contract

The collector records discovery and technical verification. It is not an application ledger or proof of human review.

## One daily review owner
JOB 1 owns the final evidence review and daily digest. Other briefings contribute leads but must not reserve or suppress a vacancy merely because the collector contains it. A future private review ledger should record exact identity, JD hash, evidence/Charter revision, review status, decision, reason, timestamp and report/run identifier. An unchanged completed review may be suppressed; new evidence, changed JD, reopened requisition or changed eligibility requires reconsideration. A seen posting is never an applied posting.

## Freshness and run correlation
For the ordinary daily review, accept a valid collector snapshot only if its timestamp is not in the future and is no more than two hours old at scan start. Label it as a snapshot and report its board coverage at its own timestamp, separately from work JOB 1 performs now. It does not claim that the collector ran for this scan.

If the snapshot is missing, invalid, future dated or older than two hours, report collector output as SOURCE_UNAVAILABLE and continue independent email and employer sources without collector coverage claims.

If Anna expressly requests a newly run collector, require output after that request and correlation to a run ID. Legacy reports without a run ID cannot establish correlation. The current production collector has no run ID, so it cannot satisfy this stricter request. Do not silently substitute a scheduled snapshot for an expressly requested new run.

The offline `inspect_packet` diagnostic defaults to the stricter requested-run contract. Use `--scheduled-snapshot` for the approved two-hour daily snapshot check. Snapshot coverage is never labelled as work done by the current review. The helper never starts collection or writes state.

Future collector rollout can add run_id, run_started_at, completed_at, code revision, source revisions and a generation manifest. Publish immutable per-run output and a final pointer only after all generation files save. This requires separate migration, backup and rollout review.

## Matching evidence
Read current factual sources, using Anna's direct confirmation, Evidence Bank, Charter, then Master CV. Map central requirements to exact JD text, evidence citation and confirmed scope. Preserve direct/transferable/unknown/gap distinctions, metric population, shared ownership, dates and exclusions.

Availability, professional fit and employment eligibility are separate dimensions. An HTTP error means availability unknown. An unknown fact is a question, not a confirmed gap. Check current sources and prior clarification before asking. Do not invent numerical fit thresholds or treat triage scores as interview probabilities.

## Coverage and queue visibility
Report configured, attempted, complete, incomplete, unavailable and not attempted separately. Paused boards are a subset of not attempted. Diagnostic events are not unique vacancies. Carry-over queues are not new discoveries. A 20-record packet is a work budget, not the full queue or a recommendation quota. Preserve source provenance and employer verification separately.

## Rollout and rollback
This code change affects local JobOps imports and adds a pure diagnostic. It changes no collector, trigger, Drive state, Sheets data or application action. Before installing, export a private workspace backup. Unknown Tracker statuses and ambiguous title-only matches fail for review rather than resetting history. Conflicting duplicate vacancy statuses also fail. Existing duplicate records require a preview and backup; this patch does not automatically consolidate them.

Restore the private backup and previous app revision to roll back. Any update of the live Apps Script project, trigger or production state is a separate action and requires explicit authorization.
