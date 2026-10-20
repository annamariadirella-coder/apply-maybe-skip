# Public recruiting pages

This optional collector adapter accepts explicitly configured recruiting pages on published Google Docs and Notion Sites. It does not search the web for documents, enumerate subpages, parse multi-role boards, authenticate to private documents or establish employer ownership. Configure one vacancy per page. All results enter discovery_review as unverified leads, subject to normal eligibility, deduplication, catchup and Tracker checks. They do not become APPLY/MAYBE recommendations.

No paid API or new account is required by the adapter. It remains disabled when PUBLIC_RECRUITING_SOURCES is absent. Code changes are local until installed in the existing Apps Script project; no new trigger or folder is needed.

## Configuration

Set the private Script Property PUBLIC_RECRUITING_SOURCES to a JSON array of at most five entries. The values below are fictional, not working sources:

```json
[
  {
    "url": "https://docs.google.com/document/d/e/fictional/pub",
    "company": "Fictional Company",
    "title": "Head of Operations",
    "location": "Berlin"
  }
]
```

Use the exact published URL, without query parameters, fragment or credentials. Accepted forms are https://docs.google.com/document/d/e/ID/pub and https://WORKSPACE.notion.site/PAGE. Private/edit Google Docs links, notion.so workspace links, custom domains and redirects are deliberately unsupported in this initial adapter. Obtain a canonical published link, or use the manual text path. Never publish a private career document to make this adapter read it.

Each entry requires company, title and location (nonempty strings, max 200 characters). These are user-supplied metadata, not facts inferred or verified by the collector. Optional published_at supplies a publication date; omitting it yields an unknown-date lead. Optional text supplies recruiting text copied manually from that page (max 50,000 characters). When text is supplied, no request is made and source_capture_method is pasted_text; do not interpret its capture timestamp as a live employer check. Script Properties have their own storage limits, so keep this a small source registry and short excerpts.

## Extraction and provenance

The anonymous fetch sends no authorization header and does not follow redirects. Only HTTP 200 is parsed. Parsing rejects responses longer than 250,000 characters and descriptions shorter than 200 characters. The body download itself is subject to Apps Script limits; this is a parsing bound, not a streaming byte limit. Script/style/noscript blocks are removed. Automatic extraction requires a main/article element or a published Docs contents container. Dynamic Notion pages may require pasted text; no browser renderer or undocumented Notion API is used.

source_url, source_capture_method and source_captured_at accompany the lead, alongside source_first_seen_at/source_last_seen_at. None proves the vacancy is open. Supported ATS links in the extracted content can teach a company board, subject to the existing allowlist; other extracted links are never fetched. Text is untrusted reference data, never executable instructions.

A source error is reported without blocking ordinary feeds or deleting prior leads. Duplicate configured page URLs are rejected. Malformed registry configuration is reported separately and ordinary feeds continue. One page containing multiple vacancies needs manual review rather than being treated as one accurate JD.

## Validation

Synthetic tests cover published Docs and Notion fallback, disallowed hosts/private links, redirects, authorization failures, script removal, body size, missing readable content, registry limits, provenance, deduplication, ATS learning, outage retention and Tracker removal. No real employer page has been certified by these fixtures. Validate a real public recruiting page offline before installing the adapter for personal use.

Provider references: [Google publishing](https://support.google.com/docs/answer/183965), [Notion publishing and sharing](https://www.notion.com/help/public-pages-and-web-publishing).
