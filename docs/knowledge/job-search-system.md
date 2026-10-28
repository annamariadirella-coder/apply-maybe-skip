# Job search system knowledge

## Ownership and sources of truth

- The private Google Drive Career Evidence Bank is the factual career record. Anna's direct confirmation outranks it; the Positioning & Targeting Charter defines targeting and boundaries; the Master CV is a presentation source.
- The Google Sheets Job Search Tracker is the application history. It is not a discovery queue. A conflict between records requires investigation; never resolve it by import order.
- The private Apps Script collector rotates employer ATS boards and writes its private Drive snapshot and queue. GitHub code is not proof of the deployed script revision.
- JOB 1 owns the final daily evidence review and digest. The collector is an input to that review, not a verdict and not another owner that can suppress leads.
- HiringCafe and other aggregators provide discovery leads only. An original employer page or authorized ATS must verify availability before a role is marked live.

## Architecture

ATS and public source collection -> private candidate packet and queue -> employer status check -> evidence based assessment -> human review in JOB 1 -> human application decision recorded in Tracker.

The dashboard and extension support private local review. The public index is a separate product surface and must not receive career profiles, Tracker state, source documents or private collector details.

Keep the existing collector and review flow. Consolidate repeated prompt policy into a short project map, topic knowledge, reusable procedure and small deterministic tools. Consider a backend or database only after measured evidence shows these pieces cannot support the workflow.

## Review state

Discovery is not assessment; queue membership is not presentation; presentation is not application. A future private review ledger may record exact requisition identity, JD revision, evidence/Charter revision, review outcome, disposition and timestamp. Until that exists, do not claim persistent assessment history.

When a source report is truncated, report the omissions and use only its observed records. Diagnostic events are not unique vacancies. Carry-over queues are not new discoveries. A bounded candidate packet is a work budget, not a recommendation quota.

## Approved collector freshness rule

For the ordinary daily review, accept a valid collector snapshot only when its timestamp is not in the future and is no more than two hours old at scan start. Label its timestamp and report its board coverage as snapshot coverage, separate from current JOB 1 work. This does not claim a new collector run.

If the snapshot is missing, invalid, future dated or older than two hours, mark collector output SOURCE_UNAVAILABLE and continue independent email/employer sources without collector coverage claims. If Anna expressly requests a newly run collector, require output after that request and a run identifier correlated to it. The current production collector has no run identifier, so it cannot prove that stricter contract yet.

The approved default freshness change applies to the JOB 1 review contract only. It does not start collection or alter production Apps Script, triggers, Tracker or processed state. Adding run identifiers, manifests and atomic publishing requires separate implementation and rollout.

## Known system issue

GitHub main, the open integration branch, private historical repository and deployed Apps Script can differ. Inspect the actual installation before a future production update. Keep one writer, preserve state and take a recoverable backup before installation.
