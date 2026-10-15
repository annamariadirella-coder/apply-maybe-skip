# Search preferences in natural language

The dashboard profile now includes Describe your search. This first version is a local rule-based parser for explicit English/Italian preference phrases. It makes no network or model calls and has no paid API dependency. It is not a general conversational interpreter.

Write preferences, select Preview preferences, inspect what was understood and what needs your interpretation, then select Add suggestions to fields. Existing field values are merged rather than replaced. Review every field, remove conflicts with existing settings, and select Save profile. Preview and Add do not save anything. Closing the form discards the pending edits. Editing the text invalidates the preview; generate a new preview before adding suggestions.

Example (fictional preferences):

> Cerco Product Operations, Business Operations. Valuto anche Strategic Projects. Escludo Account Executive. Preferisco lavorare a Berlin, Remote Europe. Livello: senior, lead. Parlo English, Italian. Non parlo German.

Supported English equivalents include I am looking for, I would also consider, I want to avoid, I prefer to work in, Seniority:, I speak and I do not speak. Separate values with commas and clauses with full stops, semicolons or newlines. Role/location names remain as supplied; this version does not translate them or infer arbitrary cities, language levels or work permissions. Conditional/negative qualifiers such as but not and unless require manual interpretation. Conflicting exact language or target/excluded-role declarations are omitted from suggestions and flagged for resolution; semantic aliases and conflicts with existing fields still require review.

The raw text is preserved in naturalLanguageIntent in local profile settings, including parts the parser does not understand. It does not feed scoring directly. Only confirmed structured fields reach the existing profile/evaluation flow. Career claims and strengths are never generated from this text; verified strengths and evidence keep their existing separate workflow. Language declarations are suggestions that the user must confirm, not an automatic assessment of proficiency.

This control is in the shared dashboard used locally and through the extension. The separate advanced extension options page and private Apps Script Charter are unchanged. To use preferences in the personal collector, a later explicit reconciliation with its Charter/configuration is needed; saving this dashboard form does not write Google Drive or reconfigure the active scan.

Tests cover Italian/English phrases, negation, unsupported experience claims, contradictions, input limits, merge preservation and the dashboard preview/add/save flow. No personal profile is included in fixtures.
