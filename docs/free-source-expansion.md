# Free employer-source expansion — 21 October 2026

This change adds 13 employer feeds to the existing 374, for 387 configured feeds across eight providers. Parloa and Omio already had feeds at other providers; this expands endpoint coverage, not necessarily the number of unique employers. No source is a promise of a suitable vacancy or interview.

| Provider | New configured feeds |
| --- | --- |
| Ashby | Eye Security, Platform Engineering, Oyster, MUI, Parloa, Ben, SoSafe, Percona |
| Lever | Crosslake Technologies |
| Greenhouse | Typeform, Omio (`omiocorp`) |
| Teamtailor | Shine (`careers.shine.co`), Holafly (`careers.holafly.com`) |

No credentials, subscription, paid AI call or auto-application was added. The existing review and filter gates remain in force. Python's optional matcher catalog receives the 11 feeds using providers it already supports; Teamtailor is currently implemented only in the Apps Script collector. Intellias/DataArt and broader discovery/shortlist features are separate existing PRs and are not silently merged here.

## Verification

The [supplemental audit](../services/collector/source-expansion-audit.json) records public endpoint URLs, checked times and row counts for just these 13 feeds. All returned HTTP 200 on 21 October; all rows in the downloaded responses passed their collector parser. Counts are observations of employer feed responses before eligibility/Tracker filtering, not recommendations or market recall. The old `board-audit.json` remains a dated 374-feed snapshot and was not regenerated.

Teamtailor was additionally checked against its own public career feed, bringing the cross-site sample to three. A two-request check on Shine with `per_page=1` returned different job IDs and forward `next_url` links for pages 1 and 2. The implementation accepts only same-origin `/jobs.json` pagination, exact page increments and the configured page size. Redirects are not followed. Cached live responses stay private; committed fixtures are fictional.

These are checks from the development runner, not a production Google scan. Public endpoints and schemas can change. Runtime failures must remain visible in board health and must not be interpreted as an empty employer market.

## Teamtailor contract

The [documented Teamtailor API](https://docs.teamtailor.com/) uses an account-issued token. This adapter uses the separate anonymous employer JSON Feed at `/jobs.json`, observed directly on [Shine](https://careers.shine.co/jobs), [Holafly](https://careers.holafly.com/) and [Teamtailor](https://career.teamtailor.com/jobs). It does not obtain or reuse a token.

- Require JSON Feed version 1/1.1, the employer's feed URL, an items array and valid forward pagination. Invalid/oversized pages or duplicate active IDs are errors.
- Match each numeric employer job ID to `_jobposting.identifier.value`, with a matching title and same-origin job URL. The feed UUID is not the posting identity. Keys include the employer host to avoid cross-company collisions.
- Keep the employer feed's complete description and structured location facts. Missing country/location remains unknown; generic remote wording is not promoted to worldwide/Germany eligibility. Explicit expiry is respected.
- Validation searches at most three pages per employer per scan, caching that snapshot for the remaining candidate batches. A located, identity-matching posting with a sufficiently long JD can be checked from that fresh employer feed even if later pages fail. An absent posting is considered removed only after a complete successful feed traversal; HTTP failure, page limits, malformed data and redirects keep it unresolved/queued.
- Existing board-page limits and checkpoints govern collection. A listing page contributes to the complete run cache only if it is the whole board. There are no additional long retry loops or changes to the scan time limit, candidate cap or Workable quota.
- Discover new Teamtailor subdomains from correctly formed employer job links. Custom domains are recognized only if explicitly configured. Arbitrary custom hosts from untrusted discovery text are not automatically trusted.

Greenhouse European career links are now recognized when identifying a board; the existing public `boards-api.greenhouse.io` endpoint was directly checked for Omio. Workday remains unsupported: the earlier single-tenant probe did not establish safe completeness or detail handling. This PR does not present Workday or other untested systems as collected sources.

## Tests, migration and rollback

Synthetic regression checks cover identity/title/host mismatch, absent country/location, expiry, unsafe feed URLs and pagination, second-page presence, terminal absence, redirects/403/404/429/503, three-page truncation, cache reuse, repeated IDs and collection checkpoint resumption. Existing suites cover queue/state preservation, AI opt-in boundaries and workspace import/status preservation.

This branch builds on the diagnostic branch (PR #3); it does not merge or deploy that PR. Before applying changes to an existing Google installation, reconcile with its current source. The owner's installed version has queue/archive/priority/workspace logic absent from the public base. Source changes must be ported into that source and tested independently. No production source, trigger, Script Property, Tracker or processed state is changed by this PR.

Catalog entries are appended; existing board identities and version-1 state remain usable without resetting the queue or rotation cursors. More configured feeds can increase the time needed for a complete rotation; the per-run request/time/candidate limits remain unchanged. Some new feeds will contain no eligible roles.

Rollback the public change by reverting this PR and regenerating the collector test copy. For any later authorized Google installation, keep the exact prior source and restore it without rebuilding state, folders or triggers. New Teamtailor queue records can remain in state while source support is rolled back; preserve that data and review it rather than deleting it. No production rollback was needed here because no installation occurred.
