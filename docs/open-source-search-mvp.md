# JobOps open-source search MVP

JobOps is being extended into two layers:

1. a provider-neutral public job-search index, similar in purpose to HiringCafe;
2. the private Annamaria workspace, which applies evidence, Tracker state and personal decisions on top.

The public layer stores employer-published vacancy data only. It does not contain a candidate profile, application status, private notes, processed state or credentials. The first reusable core is `services/search/index.js`: it normalizes public roles, upserts them by canonical employer URL, searches by text/location/workplace/salary and reports aggregate index coverage. `services/search/collector.js` converts only employer-verified collector candidates into public records; discovery leads and personal evaluation fields remain private.

The current collector already supplies the first source adapters and 387 configured feeds. The next increments are:

- turn collector output into public-index records with freshness and active/closed state;
- add provider adapters behind a common source contract;
- expose read-only search and filter endpoints/UI;
- accept a submitted employer job link as a candidate source, then verify the employer feed before adding it;
- keep private profile matching and Tracker synchronization outside the public index.

The first public-facing interface is in `apps/search/`. It is intentionally read-only and works with a generated `data/jobs.json` index, so the public site never needs Annamaria's profile or Tracker data. The private workspace remains available through the separate dashboard link.

This is an open-source search engine inspired by HiringCafe's workflow, not a copy of its data, code or private ranking. HiringCafe remains a useful discovery radar; JobOps can accept links from it and verify the employer's original source.

`services/search/link-intake.js` is the first step of that workflow. A HiringCafe link or an employer ATS link becomes a reviewable lead with a provider hint, never a verified public job by itself. The employer source must still be found and checked before the record enters the public index.

For a local refresh, put verified collector reports in `local-data/public-reports/` and run `npm run refresh:public-index`. The generated `apps/search/data/jobs.json` is ignored by Git, so the refresh stays local and cannot publish private data accidentally. Use `--reports-dir` and `--output` to choose different paths.

HiringCafe is an optional discovery source through `services/search/hiringcafe.js` and `services/search/discovery.js`. It is bounded to small read-only queries, and every result remains a lead until the employer URL is verified. The adapter has no credentials and does not submit applications. Projects using it should respect HiringCafe's published limits and terms; ATS and employer sources remain the durable verification layer.
