# Contextual targeting review

The optional **Broad search with contextual review** setting keeps opportunities visible when titles or weighted signals do not match saved directions. Enable it in the dashboard profile. Existing profiles retain weighted screening until explicitly changed; switching back restores the previous behaviour without changing jobs, statuses or notes.

This is preliminary triage, not evidence assessment. In contextual mode, a title/function/seniority mismatch, technical keyword signal or low score leads to **Maybe** for review, rather than an automatic rejection. High scores also remain **Maybe**: triage cannot establish that a mandate is directly supported or that transferable experience provides a sufficient bridge. Review the principal responsibilities, evidence and practical questions to decide whether an opportunity is priority, exploratory or unsuitable.

Explicit practical conflicts such as a required unavailable language retain **Skip**. A missing full description/profile or stale employer check retains **Blocked**. The latter does not establish that a posting is closed or that the professional fit is poor.

`review_dimensions` keeps `professional_priority: to_clarify`, posting availability and practical eligibility separate. Eligibility defaults to unknown because absence of a detected conflict is not proof of compatible contract, travel, salary or Germany employment setup. The displayed score remains a descriptive triage signal; it is neither direct-evidence coverage nor an interview probability.

## Scope and migration

No schema version migration is needed: `triageMode: contextual` is an optional profile setting used by shared `core/evaluate.js`. Dashboard and extension continue to call that shared evaluator; the dashboard exposes the setting and shows the dimensions. Imported job fields cannot activate this policy or supply a trusted professional-priority assessment. Existing storage, backup, historical assessments, application decisions and notes remain intact. No external service, paid AI call or application submission is added.

The optional AI evidence matcher and collector discovery filters still use their existing policies. This change does **not** recover opportunities that a collector omitted before import and does not activate the revised policy in a running installation. Those layers require a separate coordinated change: classify central specialist requirements with quoted evidence, allow supported transferable bridges, and preserve source/freshness checks. Do not describe this preliminary review mode as a completed migration of the evidence matcher or discovery pipeline.

## Verification and rollback

Tests cover adjacent/unknown titles, usually skipped seniority, mandatory language conflicts, stale/unavailable verification, incidental pipeline/P&L mentions, positive-score caution, setting persistence and isolation from untrusted job fields. Compare fictional cases before publishing. Roll back by selecting **Weighted signals**, or removing the optional setting; no data rewrite or production trigger change is required.
