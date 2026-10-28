---
name: job1-review
description: Review the private job search snapshot and independent leads for Annamaria, verify vacancies, deduplicate exact requisitions and report evidence-backed priorities.
---

# JOB 1 review procedure

1. Read the current project instructions and relevant knowledge: `docs/knowledge/job-search-system.md`, `docs/knowledge/decisions.md`, and `docs/review-coordination.md`.
2. Record local scan start in UTC and Europe/Berlin.
3. Read current private Evidence Bank, Charter and Tracker before assessing roles. Do not put their contents, identifiers or exports into public repository files.
4. Inspect the latest collector JSON and its Drive modified time. For ordinary daily review, accept only a valid timestamp that is no more than two hours old at scan start and is not in the future. Label it a snapshot. Keep its coverage distinct from work completed now.
5. If the snapshot fails that test, report the collector as SOURCE_UNAVAILABLE and continue any independent permitted sources. If the user expressly requested a new collector run, also require post-start output and a correlated run ID; otherwise stop that collector branch as no_update.
6. Treat the collector candidate cap and accumulated queues as work queues, not recommendations or new discoveries. Keep source attribution and employer verification evidence.
7. Verify the exact original employer/authorized ATS posting, live application path, location eligibility, language and work model. Technical access failures mean availability unknown.
8. Deduplicate exact requisition IDs/canonical URLs against Tracker and all source inputs. A previously considered employer or title is not itself a duplicate. Resolve conflicting Tracker states as a data question.
9. Map central JD requirements to current cited evidence and preserve scope, shared ownership, timeframe, population and confirmed gaps. Check prior facts before asking Anna.
10. Publish VERIFIED, TO VERIFY and SOURCES UNAVAILABLE with timestamp and observed counts. Separate collector snapshot coverage from JOB 1 work. Do not claim exhaustive source coverage or invent an empty result.
11. Do not edit production Apps Script, triggers, Tracker, processed state, send mail, contact employers or apply unless explicitly authorized.

For offline packet diagnostics, use `node scripts/inspect_packet.mjs FILE START_TIME [RUN_ID]`. The helper is read-only and does not make the ordinary daily snapshot policy a requested-run policy.
