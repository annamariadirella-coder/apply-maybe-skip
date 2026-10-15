# Local semantic ordering and the 3 + 2 review shortlist

## Review shortlist

The dashboard shows up to three Strong review matches and two Wildcards to investigate. This is preliminary triage, not the collector's cited evidence assessment or a claim that requirements are proven. Strong slots require Apply triage, a complete JD, a usable posting URL, a recent employer check, a configured profile, a positive saved-strength signal and no reported gaps or requirement risks. Wildcard slots require Maybe triage, a positive saved-strength signal and explicit gaps shown alongside the selection. Blockers exclude both categories. Applied and other completed-status roles are excluded. Duplicate canonical URLs share a slot; conflicting unverified/status records are conservatively excluded. Company variety is preferred when eligible alternatives exist.

The shortlist never fills empty places with weak/unverified leads. It records no application or automatic status change. Human evidence review remains required, especially for wildcards. Declared strengths are screening inputs, not automatically validated career facts. The actual evidence-based 3+2 digest for the private personal scan still requires reconciliation with Anna's private evidence and sources; this dashboard feature does not install that workflow.

## Optional local embeddings

Without embeddings, ordering uses existing triage. The optional Python entry point writes a separate enriched candidate packet for manual Import scan. It accepts only a trusted model directory already on disk, uses CPU, sets Hugging Face/Transformers offline mode, and disables remote model code. There is no paid API, automatic model download, web service, scheduler or Drive write. Install requirements-semantic.txt in a local Python environment when opting in; obtaining a model, checking its license and pinning its actual version are separate steps.

From services/matcher, with private files outside Git:

```text
python -m src.semantic_rank --packet private/candidates.json --profile private/jobops-backup.json --model LOCAL_MODEL_DIRECTORY --model-version EXACT_LOCAL_SNAPSHOT --output private/candidates-ranked.json
```

The profile input can be dashboard backup JSON or the settings object itself. Use a new output filename. The query contains target roles, adjacent roles and declared strengths. Job text is chunked into overlapping 160-word passages, advanced by 120 words; the highest cosine similarity is retained. Word chunks reduce truncation but do not guarantee fitting every tokenizer's limit. The model must support encode_query/encode_document. Sentence Transformers 5.x is an optional dependency; no model weights are bundled or silently installed.

The enriched semantic record stores model_version, score and exact query/document snapshots. The dashboard ignores scores when current role/strength settings or job text differ, or scores are invalid. Metadata comes from an imported local file, not a signed assessment. It can change ordering only after the existing verification and triage gates pass. It cannot set APPLY, establish fit, prove a skill, override a hard conflict or turn a discovery lead into a verified posting. No numerical similarity threshold is advertised as a validated fit threshold. Version the model and benchmark multilingual, negated, direct, transferable and gap cases before relying on its ranking. Persistent embedding caching and requirement-to-evidence retrieval remain future work.

## Verification limits

Tests exercise query/document snapshot parity, cosine validation, passage aggregation, input preservation, normalization/import, ordering, profile/JD invalidation, quota caps, duplicate handling and hard gate precedence. Embedding tests use a deterministic fake encoder to verify plumbing: a real multilingual model has not been installed or benchmarked in this task. No real candidate has been ranked or recommended. Neither semantic ordering nor this shortlist is installed in the active personal collector.

API reference: [SentenceTransformer local loading and encoding](https://sbert.net/docs/package_reference/sentence_transformer/model.html).
