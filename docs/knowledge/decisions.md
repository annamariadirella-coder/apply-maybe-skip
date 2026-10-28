# JobOps decisions

- Keep the current collector and private review flow; do not replace architecture without measured evidence.
- One owner (JOB 1) publishes the final daily assessment. Collector and discovery sources provide inputs.
- The approved daily collector freshness window is two hours at JOB 1 scan start; report snapshot age and its own coverage clearly.
- A specifically requested new collector run still requires post-start output and run correlation. Legacy reports without a run ID cannot satisfy that guarantee.
- Distinguish discovered, employer verified, assessed, presented and applied states. Never infer one from another.
- Match exact vacancies across tracker aliases; a different requisition at the same employer remains reviewable.
- Conflicting application states require evidence and human resolution.
- Career evidence stays factual and private. Use direct/transferable/unknown/gap with scope and source citations.
- No auto-apply, outreach, paid AI enablement or production state writes without explicit authorization.
