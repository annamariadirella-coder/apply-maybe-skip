# Review and coordination contract

Collector state records discovery and technical verification. It is not an application ledger or proof of human review.

## One daily review owner
Keep one private collector writer. JOB 1 owns the final evidence review and daily digest. Other briefings may contribute leads, but must not reserve or suppress a vacancy merely because the collector contains it. A future private review ledger should record exact identity, JD hash, evidence/Charter revision, review status, decision, reason, timestamp and report/run identifier. An unchanged completed review may be suppressed; new evidence, changed JD, reopened requisition or changed eligibility requires reconsideration. A seen posting is never an applied posting.

## Correlation and freshness
The offline inspect_packet command is diagnostic only; it never starts collection or writes state. It defaults to the stricter requested-run contract: an expected run ID and output timestamp at or after the requested start are both required. Existing legacy reports have no run ID and cannot establish correlation.

A scheduled collector snapshot is a different input. A reviewer may explicitly choose scheduled_snapshot plus an approved maximum age. It remains labelled as a snapshot; its counts do not become coverage performed by the review. Do not silently replace a user's requirement for a new run with this mode. No production gate, schedule or trigger is changed by this patch.

Do not require a new collector output to review independent email/employer sources; if the active task explicitly requires a new collector run, report the missing prerequisite and follow that task's stop rule until changed with approval.

Future collector rollout should add run_id, run_started_at, completed_at, code revision, source revisions and a generation manifest. Publish immutable per-run output and a final pointer only after all generation files are saved; use the pointer to reject mixed JSON/Markdown/state generations. Keep one writer and a bounded lock. This requires a separate production migration and state preservation review.

## Matching evidence
Read the current factual sources rather than previous scan prose. Use candidate confirmation, Evidence Bank, Charter, Master CV in that order. Map each central requirement to an exact JD quote and source paragraph, confirmed scope and direct/transferable/unknown/gap status. Preserve metric population, shared ownership, date uncertainty and exclusions.

Availability, professional fit and employment eligibility are separate dimensions. A blocked page or HTTP error means unknown availability. An unknown fact is a question, not a confirmed gap. Ask only after checking the current sources and prior confirmed clarification. Do not invent numerical fit thresholds or claim a triage score is an interview probability.

## Coverage and queue visibility
Report configured, attempted, complete, incomplete, unavailable and not attempted separately. Paused boards are a subset of not attempted; do not add them twice. Diagnostics evaluation events are not unique vacancies. Carry-over queues are not new discoveries. A 20-record packet is a work budget, not the full queue or a recommendation quota. Preserve discovery source and employer verification separately.

## Rollout and rollback
This change affects local JobOps imports and adds a pure diagnostic module. It changes no collector, trigger, Drive state, Sheets data or application action. Export a private workspace backup before installing. Unknown Tracker statuses and ambiguous title-only matches fail for review rather than resetting history. Installation against a workspace containing duplicate historical records requires preview and a backup; this patch does not automatically consolidate existing records. Restore the private backup and previous app revision to roll back.

Use synthetic tests in public repositories. Keep real snapshots, Tracker extracts, candidate evidence and audit findings private.
