# Integration validation — 2026-10-15

## What was verified

- An explicit fictional Notion recruiting source enters the private discovery queue as an unverified pasted-text lead.
- A 45-day-old lead is retained outside the 30-day report window and reappears with the 60-day setting.
- Its supported ATS reference teaches a board without implying a verified employer posting.
- An English/Italian intent-derived profile feeds the existing profile builder.
- A discovery lead cannot enter the shortlist merely through import, even when its content is relevant.
- Token-aware passages respect the model input budget and preserve late content; oversized queries fail explicitly. Existing encoders without tokenizers retain the test fallback.

Synthetic suites passed: 99 JavaScript tests, 49 Python tests and 10 Apps Script collector suites. These are engineering checks, not measured job-search performance. No source credential, career evidence, real candidate report or active automation was changed.

## Real model attempt

Selected model: sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2, pinned revision e8f8c211226b894fcb81acc59f3b34ba3efd5f42. The publisher's [model card](https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2/blob/e8f8c211226b894fcb81acc59f3b34ba3efd5f42/README.md) declares Apache-2.0, includes Italian/English and documents a 128-token maximum. Only safetensors weights, configuration, tokenizer assets and the card were downloaded into ignored local storage; model weights are not committed.

Installed an isolated runtime with torch 2.14.1+cpu, sentence-transformers 5.7.0, transformers 5.19.0, numpy 2.5.4 and sentencepiece 0.2.2. PyTorch imported, but Sentence Transformers failed during dependency import: numpy.random._philox could not load because Windows Application Control blocked the native library. No security settings were changed. The real model did not produce embeddings, scores or a shortlist; ranking accuracy and multilingual preference-pair results remain unmeasured. This is an environment block, not a demonstrated model failure or success.

## Reproducible acceptance set

scripts/semantic_acceptance.mjs prepares nine fictional cases: direct English fit, Italian equivalent, paraphrased responsibilities, adjacent role, unrelated pastry work, German-language conflict, stale verification, unverified public page and relevant content late in a long JD. Labels are synthetic expectations, not Anna's career evidence. The verifier checks Python/JavaScript snapshot compatibility, shortlist gates and three relative ranking comparisons against unrelated work. It reports comparison failures rather than pretending semantic similarity is qualification.

From repository root, in a compatible runtime:

```text
node scripts/semantic_acceptance.mjs prepare .venv/semantic-acceptance-new
```

From services/matcher:

```text
python -m src.semantic_rank --packet ../../.venv/semantic-acceptance-new/packet.json --profile ../../.venv/semantic-acceptance-new/profile.json --model LOCAL_MODEL_DIRECTORY --model-version e8f8c211226b894fcb81acc59f3b34ba3efd5f42 --output ../../.venv/semantic-acceptance-new/ranked.json
```

Then from repository root:

```text
node scripts/semantic_acceptance.mjs verify .venv/semantic-acceptance-new
```

Use a new output folder; preparation preserves existing files. The prepared local nine-case set is available under ignored .venv/semantic-acceptance, but ranked.json and acceptance.json were not produced because inference did not start. Even a successful nine-case run would be a smoke test; a larger labeled evaluation, evidence-passage retrieval and personal profile reconciliation remain required before recommending rollout.

## Rollout status

All feature code remains on the local scan-rotation-diagnostics branch. No push, pull request, Apps Script installation, deployment, trigger change, live state write or personal shortlist was performed. The private scan continues with its prior installed version. Normal triage and the preliminary dashboard shortlist do not require the optional embedding runtime.
