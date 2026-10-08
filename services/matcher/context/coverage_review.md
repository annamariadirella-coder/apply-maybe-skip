# Market coverage review

This is a personal search strategy, not a claim of complete market coverage.

Daily automatic discovery: configured and learned employer ATS boards, Arbeitnow, Jobicy and Remotive. Use the private report's per-source posting/company counts, matching role families, errors and `truncated` flags to assess coverage. Counts describe fetched listings, never suitable jobs or the size of the market. Aggregator data needs original-employer validation. Jobicy exposes a seven-day window; Remotive delays public results by 24 hours. Arbeitnow and Jobicy are bounded to ten pages per scan. The sources and bounds are in discovery_sources.json.

Arbeitnow checks pages 1–3 every run and spends the remaining page budget on a persistent historical sweep. The private checkpoint advances only after successful collection, overlaps one prior page, and resets to page 4 at the end. Review `pages_visited`, `next_backlog_page` and `cycle_finished` in the report. Mutable offset pagination means this is a best-effort sweep, not proof of all live listings at one instant. Jobicy starts a new traversal each run; do not persist its 24-hour cursor as if it were permanent. Unreviewed research leads persist separately, remain unverified and retain last-seen dates; absence from today's pages is not evidence of closure.

Periodically compare the automatic collection with a focused public-web search across these role families:

- Product Operations / Product Strategy & Operations / Operational Excellence
- Strategy & Operations / Business Operations / Strategic Projects
- Chief of Staff / COO Office / Founder Office
- Customer, Service and Deployment Operations / Implementation and Delivery Leadership
- Partner, Marketplace and Platform Operations / Enablement / Transformation
- Music-tech Product & Operations leadership

For each family, search Berlin/Germany and remote Germany/Europe/EMEA, including title synonyms and the business problem. Check the actual employer JD, posting status and fresh Tracker. Do not assume a remote Europe role permits Germany. German preferences are not blockers; mandatory professional German is. Manager titles need scope review.

Record missing vacancies and why they were missed in the private Drive report, not GitHub. Add an employer board when its public supported ATS URL is verified. Native ATS URLs found in eligible feed records may be learned automatically; learned boards rotate in batches of twenty. Unsupported ATS platforms and pages without a supported public feed still need manual discovery. Search engines, LinkedIn alerts, startup portals and specialist music-tech boards are not currently automated. Do not imply that they are.

Never add paid APIs, accounts, inbox permissions or public publishing merely to increase coverage. The free collector runs without paid AI; evidence-based APPLY/MAYBE review remains in chat. Show only the final credible recommendations to the candidate, not a discarded-role list or the technical research queue.
