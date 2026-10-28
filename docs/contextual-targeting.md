# Contextual targeting review

The optional **Broad search with contextual review** setting keeps opportunities visible when titles or weighted signals do not match saved directions. Enable it in the dashboard profile. Existing profiles retain weighted screening until explicitly changed; switching back restores the previous behaviour without changing jobs, statuses or notes.

This is preliminary triage, not evidence assessment. In contextual mode, a title/function/seniority mismatch, technical keyword signal or low score leads to **Maybe** for review, rather than an automatic rejection. High scores also remain **Maybe**: triage cannot establish that a mandate is directly supported or that transferable experience provides a sufficient bridge. Review the principal responsibilities, evidence and practical questions to decide whether an opportunity is priority, exploratory or unsuitable.

Explicit practical conflicts such as a required unavailable language retain **Skip**. A missing full description/profile or stale employer check retains **Blocked**. The latter does not establish that a posting is closed or that the professional fit is poor.

`review_dimensions` keeps `professional_priority: to_clarify`, posting availability and practical eligibility separate. Eligibility defaults to unknown because absence of a detected conflict is not proof of compatible contract, travel, salary or Germany employment setup. The displayed score remains a descriptive triage signal; it is neither direct-evidence coverage nor an interview probability.

## Scope and migration

No schema version migration is needed: `triageMode: contextual` is an optional profile setting used by shared `core/evaluate.js`. Dashboard and extension continue to call that shared evaluator; the dashboard exposes the setting and shows the dimensions. Imported job fields cannot activate this policy or supply a trusted professional-priority assessment. Existing storage, backup, historical assessments, application decisions and notes remain intact. No external service, paid AI call or application submission is added.

The collector and optional evidence matcher support the same opt-in policy through `TARGETING_MODE=contextual`. Existing installations retain their previous policy until explicitly configured. In Apps Script set the Script Property; for the Python orchestrator set the environment variable. The dashboard profile setting is independent and must also be selected for contextual preliminary triage. An imported packet cannot change the user's profile setting.

Contextual collection does not exclude jobs for a title, role-family keyword, seniority label or unconfirmed location. An explicit remote-only restriction outside the configured country still excludes the posting. Language/contract/travel questions remain for evidence review rather than being inferred from a title or incidental keyword. Queue limits, source rotation, live validation and deduplication remain unchanged. A broader queue can take more runs to clear; no larger fetch or paid-AI budget is silently enabled.

The contextual matcher uses a separate strict schema. Each requirement identifies whether it is central and whether a transferable bridge is credible or unresolved. A mandate conclusion needs a rationale; priority cannot contain unresolved central evidence. Unsuitable requires a cited genuine gap on a central essential requirement. A strong, cited transferable bridge can support priority even below old weighted cutoffs. A supporting gap or missing practical condition does not erase professional priority; it can retain MAYBE pending clarification. Legal, authorization, account and salary-input steps retain BLOCKED. Imported review dimensions remain clearly identified as belonging to the collector's private source profile.

The schema validates exact JD/evidence excerpts and explicit limitation evidence, not the semantic truth of the model's judgement. Human review remains necessary. A model cannot confirm new candidate facts. `availability=verified_live` is set by the orchestrator after employer verification, not by the model. Contextual conclusions, citations, practical status and policy version appear in private reports.

Paid scoring remains disabled unless separately enabled using the existing controls. `TARGETING_MODE=contextual` alone enables no paid service and submits no application. No live installation, trigger or private state is changed by this repository patch.

When synchronizing the collector's generated test copies, the inventory fixture was updated to include an employer board already present in the canonical source. No new discovery source was added by this policy change.

## Verification and rollback

Tests cover adjacent/unknown titles, usually skipped seniority, mandatory language conflicts, stale/unavailable verification, incidental pipeline/P&L mentions, positive-score caution, setting persistence and isolation from untrusted job fields. Compare fictional cases before publishing. Roll back by selecting **Weighted signals**, or removing the optional setting; no data rewrite or production trigger change is required.
