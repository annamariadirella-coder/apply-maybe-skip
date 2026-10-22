# JobOps open-source search MVP

JobOps is being extended into two layers:

1. a provider-neutral public job-search index, similar in purpose to HiringCafe;
2. the private Annamaria workspace, which applies evidence, Tracker state and personal decisions on top.

The public layer stores employer-published vacancy data only. It does not contain a candidate profile, application status, private notes, processed state or credentials. The first reusable core is `services/search/index.js`: it normalizes public roles, upserts them by canonical employer URL, searches by text/location/workplace/salary and reports aggregate index coverage.

The current collector already supplies the first source adapters and 387 configured feeds. The next increments are:

- turn collector output into public-index records with freshness and active/closed state;
- add provider adapters behind a common source contract;
- expose read-only search and filter endpoints/UI;
- accept a submitted employer job link as a candidate source, then verify the employer feed before adding it;
- keep private profile matching and Tracker synchronization outside the public index.

This is an open-source search engine inspired by HiringCafe's workflow, not a copy of its data, code or private ranking. HiringCafe remains a useful discovery radar; JobOps can accept links from it and verify the employer's original source.
