/* Personal collector with opt-in evidence scoring. No source writes or applications. */
const BOARD_ROWS = [
  ["greenhouse", "getyourguide", "GetYourGuide", ""],
  ["greenhouse", "parloa", "Parloa", ""],
  ["greenhouse", "distrokid", "DistroKid", ""],
  ["lever", "spotify", "Spotify", "global"],
  ["greenhouse", "contentful", "Contentful", ""],
  ["greenhouse", "n26", "N26", ""],
  ["greenhouse", "hellofresh", "HelloFresh", ""],
  ["greenhouse", "sumup", "SumUp", ""],
  ["greenhouse", "flix", "Flix", ""],
  ["greenhouse", "soundcloud71", "SoundCloud", ""],
  ["greenhouse", "sonymusicentertainment", "Sony Music Entertainment", ""],
  ["greenhouse", "celonis", "Celonis", ""],
  ["greenhouse", "datadog", "Datadog", ""],
  ["greenhouse", "elastic", "Elastic", ""],
  ["greenhouse", "grafanalabs", "Grafana Labs", ""],
  ["greenhouse", "gitlab", "GitLab", ""],
  ["greenhouse", "canonical", "Canonical", ""],
  ["greenhouse", "stripe", "Stripe", ""],
  ["greenhouse", "adyen", "Adyen", ""],
  ["greenhouse", "databricks", "Databricks", ""],
  ["greenhouse", "mongodb", "MongoDB", ""],
  ["greenhouse", "cloudflare", "Cloudflare", ""],
  ["greenhouse", "intercom", "Intercom", ""],
  ["greenhouse", "airbnb", "Airbnb", ""],
  ["greenhouse", "wolt", "Wolt", ""],
  ["greenhouse", "commercetools", "commercetools", ""],
  ["greenhouse", "pendo", "Pendo", ""],
  ["greenhouse", "figma", "Figma", ""],
  ["greenhouse", "anthropic", "Anthropic", ""],
  ["greenhouse", "discord", "Discord", ""],
  ["greenhouse", "reddit", "Reddit", ""],
  ["greenhouse", "duolingo", "Duolingo", ""],
  ["greenhouse", "doctolib", "Doctolib", ""],
  ["lever", "aircall", "Aircall", ""],
  ["ashby", "deepl", "DeepL", ""],
  ["ashby", "n8n", "n8n", ""],
  ["ashby", "elevenlabs", "ElevenLabs", ""],
  ["ashby", "lovable", "Lovable", ""],
  ["ashby", "linear", "Linear", ""],
  ["ashby", "notion", "Notion", ""],
  ["ashby", "openai", "OpenAI", ""],
  ["ashby", "ramp", "Ramp", ""],
  ["ashby", "granola", "Granola", ""],
  ["greenhouse", "aiven", "Aiven"],
  ["greenhouse", "algolia", "Algolia"],
  ["greenhouse", "asana", "Asana"],
  ["greenhouse", "atlassian", "Atlassian"],
  ["greenhouse", "automattic", "Automattic"],
  ["greenhouse", "avivgroup", "AVIV Group"],
  ["greenhouse", "backmarket", "Back Market"],
  ["greenhouse", "babbel", "Babbel"],
  ["greenhouse", "betterup", "BetterUp"],
  ["greenhouse", "bitpanda", "Bitpanda"],
  ["greenhouse", "brex", "Brex"],
  ["greenhouse", "carta", "Carta"],
  ["greenhouse", "checkr", "Checkr"],
  ["greenhouse", "circleci", "CircleCI"],
  ["greenhouse", "cohere", "Cohere"],
  ["greenhouse", "confluent", "Confluent"],
  ["greenhouse", "contentsquare", "Contentsquare"],
  ["greenhouse", "coursera", "Coursera"],
  ["greenhouse", "dataminr", "Dataminr"],
  ["greenhouse", "dbt-labs", "dbt Labs"],
  ["greenhouse", "deliveroo", "Deliveroo"],
  ["greenhouse", "depop", "Depop"],
  ["greenhouse", "descript", "Descript"],
  ["greenhouse", "docker", "Docker"],
  ["greenhouse", "dropbox", "Dropbox"],
  ["greenhouse", "ecovadis", "EcoVadis"],
  ["greenhouse", "edb", "EDB"],
  ["greenhouse", "exabeam", "Exabeam"],
  ["greenhouse", "fivetran", "Fivetran"],
  ["greenhouse", "flohealth", "Flo Health"],
  ["greenhouse", "forto", "Forto"],
  ["greenhouse", "gleanwork", "Glean"],
  ["greenhouse", "gocardless", "GoCardless"],
  ["greenhouse", "gongio", "Gong"],
  ["greenhouse", "goodnotes", "Goodnotes"],
  ["greenhouse", "hightouch", "Hightouch"],
  ["greenhouse", "hubspot", "HubSpot"],
  ["greenhouse", "improbable", "Improbable"],
  ["greenhouse", "influxdata", "InfluxData"],
  ["greenhouse", "instabase", "Instabase"],
  ["greenhouse", "jellyfish", "Jellyfish"],
  ["greenhouse", "klaviyo", "Klaviyo"],
  ["greenhouse", "launchdarkly", "LaunchDarkly"],
  ["greenhouse", "lattice", "Lattice"],
  ["greenhouse", "lightspeedhq", "Lightspeed"],
  ["greenhouse", "lucidsoftware", "Lucid Software"],
  ["greenhouse", "marqeta", "Marqeta"],
  ["greenhouse", "miro", "Miro"],
  ["greenhouse", "mixpanel", "Mixpanel"],
  ["greenhouse", "mollie", "Mollie"],
  ["greenhouse", "mozilla", "Mozilla"],
  ["greenhouse", "netlify", "Netlify"],
  ["greenhouse", "newrelic", "New Relic"],
  ["greenhouse", "okta", "Okta"],
  ["greenhouse", "onetrust", "OneTrust"],
  ["greenhouse", "onfido", "Onfido"],
  ["greenhouse", "optimizely", "Optimizely"],
  ["greenhouse", "pagerduty", "PagerDuty"],
  ["greenhouse", "personio", "Personio"],
  ["greenhouse", "pinterest", "Pinterest"],
  ["greenhouse", "plaid", "Plaid"],
  ["greenhouse", "postman", "Postman"],
  ["greenhouse", "project44", "project44"],
  ["greenhouse", "remote", "Remote"],
  ["greenhouse", "retool", "Retool"],
  ["greenhouse", "rippling", "Rippling"],
  ["greenhouse", "roku", "Roku"],
  ["greenhouse", "samsara", "Samsara"],
  ["greenhouse", "scandit", "Scandit"],
  ["greenhouse", "sentry", "Sentry"],
  ["greenhouse", "similarweb", "Similarweb"],
  ["greenhouse", "smartsheet", "Smartsheet"],
  ["greenhouse", "snyk", "Snyk"],
  ["greenhouse", "sourcegraph", "Sourcegraph"],
  ["greenhouse", "stackadapt", "StackAdapt"],
  ["greenhouse", "storyblok", "Storyblok"],
  ["greenhouse", "synthesia", "Synthesia"],
  ["greenhouse", "tanium", "Tanium"],
  ["greenhouse", "tealium", "Tealium"],
  ["greenhouse", "tenableinc", "Tenable"],
  ["greenhouse", "thoughtspot", "ThoughtSpot"],
  ["greenhouse", "twilio", "Twilio"],
  ["greenhouse", "uipath", "UiPath"],
  ["greenhouse", "unity3d", "Unity"],
  ["greenhouse", "vercel", "Vercel"],
  ["greenhouse", "vimeo", "Vimeo"],
  ["greenhouse", "webflow", "Webflow"],
  ["greenhouse", "workato", "Workato"],
  ["greenhouse", "zapier", "Zapier"],
  ["greenhouse", "zuora", "Zuora"],
  ["ashby", "ashby", "Ashby"],
  ["ashby", "choco", "Choco"],
  ["ashby", "plancraft", "plancraft"],
  ["ashby", "mirelo", "Mirelo AI"],
  ["ashby", "neara", "Neara"],
  ["ashby", "klim", "Klim"],
  ["ashby", "bunch", "bunch"],
  ["ashby", "lemon-markets", "lemon.markets"],
  ["ashby", "almedia", "Almedia"],
  ["ashby", "voize", "voize"],
  ["ashby", "prior-labs", "Prior Labs"],
  ["ashby", "voyfai", "Voyfai"],
  ["ashby", "cursor", "Cursor"],
  ["ashby", "deel", "Deel"],
  ["ashby", "supabase", "Supabase"],
  ["ashby", "perplexity", "Perplexity"],
  ["ashby", "huggingface", "Hugging Face"],
  ["ashby", "modal", "Modal"],
  ["ashby", "dust", "Dust"],
  ["ashby", "synthflow", "Synthflow"],
  ["ashby", "qdrant", "Qdrant"],
  ["ashby", "langfuse", "Langfuse"],
  ["ashby", "calcom", "Cal.com"],
  ["ashby", "posthog", "PostHog"],
  ["ashby", "incident", "incident.io"],
  ["ashby", "attio", "Attio"],
  ["ashby", "clay", "Clay"],
  ["ashby", "mercury", "Mercury"],
  ["ashby", "tines", "Tines"],
  ["ashby", "vanta", "Vanta"],
  ["ashby", "sana", "Sana"],
  ["ashby", "raycast", "Raycast"],
  ["ashby", "resend", "Resend"],
  ["ashby", "suno", "Suno"],
  ["ashby", "udio", "Udio"],
  ["ashby", "replit", "Replit"],
  ["ashby", "livekit", "LiveKit"],
  ["ashby", "cognition", "Cognition"],
  ["ashby", "runway", "Runway"],
  ["ashby", "writer", "Writer"],
  ["ashby", "crusoe", "Crusoe"],
  ["ashby", "harvey", "Harvey"],
  ["ashby", "baseten", "Baseten"],
  ["ashby", "hex", "Hex"],
  ["ashby", "motherduck", "MotherDuck"],
  ["ashby", "watershed", "Watershed"],
  ["ashby", "polar", "Polar"],
  ["ashby", "legora", "Legora"],
  ["lever", "xsolla", "Xsolla"],
  ["lever", "bending-spoons", "Bending Spoons"],
  ["lever", "palantir", "Palantir"],
  ["lever", "mistral", "Mistral AI"],
  ["lever", "leonardo", "Leonardo.ai"],
  ["lever", "fugamusic", "FUGA"],
  ["lever", "amuse", "Amuse"],
  ["lever", "landr", "LANDR"],
  ["lever", "kobalt", "Kobalt"],
  ["lever", "merlin", "Merlin"],
  ["lever", "quantcast", "Quantcast"],
  ["lever", "veeva", "Veeva"],
  ["lever", "contentsquare", "Contentsquare"],
  ["lever", "cognism", "Cognism"],
  ["lever", "chaos", "Chaos"],
  ["lever", "appsflyer", "AppsFlyer"],
  ["lever", "pipedrive", "Pipedrive"],
  ["lever", "sonarsource", "Sonar"],
  ["lever", "shippo", "Shippo"],
  ["lever", "ledger", "Ledger"],
  ["lever", "alan", "Alan"],
  ["lever", "qonto", "Qonto"],
  ["lever", "payfit", "PayFit"],
  ["lever", "pennylane", "Pennylane"],
  ["lever", "quora", "Quora"],
  ["lever", "welocalize", "Welocalize"],
  ["lever", "appen", "Appen"],
  ["lever", "keyrock", "Keyrock"],
  ["lever", "kraken", "Kraken"],
  ["lever", "binance", "Binance"],
  ["lever", "chainalysis", "Chainalysis"],
  ["lever", "bitmovin", "Bitmovin"],
  ["lever", "omio", "Omio"],
  ["lever", "sennder", "sennder"],
  ["lever", "lime", "Lime"],
  ["lever", "mambu", "Mambu"],
  ["lever", "zenjob", "Zenjob"],
  ["lever", "flink", "Flink"],
  ["lever", "malt", "Malt"],
  ["personio", "koro-handels-gmbh", "KoRo"],
  ["personio", "spread-gmbh", "SPREAD"],
  ["personio", "deeploi", "deeploi"],
  ["personio", "avow", "AVOW"],
  ["personio", "exmox-gmbh", "exmox"],
  ["personio", "cambrium", "Cambrium"],
  ["personio", "1komma5grad", "1KOMMA5"],
  ["personio", "cloover", "Cloover"],
  ["personio", "bliq", "bliq"],
  ["personio", "eye-able", "Eye-Able"],
  ["personio", "roadsurfer", "roadsurfer"],
  ["personio", "getolo", "getolo"],
  ["personio", "urban-sports-club", "Urban Sports Club"],
  ["personio", "traderepublic", "Trade Republic"],
  ["personio", "sevdesk", "sevdesk"],
  ["personio", "jtl-software", "JTL"],
  ["personio", "finleap", "finleap"],
  ["personio", "finleap-connect", "finleap connect"],
  ["personio", "scalable-capital", "Scalable Capital"],
  ["personio", "enpal", "Enpal"],
  ["personio", "thermondo", "thermondo"],
  ["personio", "zolar", "zolar"],
  ["personio", "ecoworks", "ecoworks"],
  ["personio", "elvah", "elvah"],
  ["personio", "vialytics", "vialytics"],
  ["personio", "plan-a", "Plan A"],
  ["personio", "climatiq", "Climatiq"],
  ["personio", "carbmee", "carbmee"],
  ["personio", "leapsome", "Leapsome"],
  ["personio", "coachhub", "CoachHub"],
  ["personio", "kenjo", "Kenjo"],
  ["personio", "heyjobs", "HeyJobs"],
  ["workable", "workmotion", "WorkMotion"],
  ["personio", "lano", "Lano"],
  ["personio", "sofatutor", "sofatutor"],
  ["personio", "simpleclub", "simpleclub"],
  ["personio", "amboss", "AMBOSS"],
  ["personio", "lingoda", "Lingoda"],
  ["personio", "edurino", "EDURINO"],
  ["personio", "ninjaone", "NinjaOne"],
  ["personio", "limehome", "limehome"],
  ["personio", "holidu", "Holidu"],
  ["personio", "home24", "home24"],
  ["personio", "autodoc", "AUTODOC"],
  ["personio", "rebuy", "rebuy"],
  ["personio", "refurbed", "refurbed"],
  ["personio", "recommerce", "Recommerce"],
  ["personio", "everdrop", "everdrop"],
  ["personio", "air-up", "air up"],
  ["personio", "foodspring", "foodspring"],
  ["personio", "yfood", "yfood"],
  ["personio", "sunday-natural", "Sunday Natural"],
  ["personio", "maniko", "Maniko"],
  ["personio", "wellster", "Wellster"],
  ["personio", "clareandme", "clare&me"],
  ["personio", "mimi-hearing-technologies", "Mimi Hearing"],
  ["personio", "bettermarks", "bettermarks"],
  ["personio", "orderbird", "orderbird"],
  ["personio", "channable", "Channable"],
  ["personio", "zenloop", "zenloop"],
  ["personio", "superchat", "Superchat"],
  ["personio", "charles", "charles"],
  ["personio", "airfocus", "airfocus"],
  ["personio", "awork", "awork"],
  ["personio", "osapiens", "osapiens"],
  ["personio", "sastrify", "Sastrify"],
  ["personio", "appinio", "Appinio"],
  ["personio", "adjust", "Adjust"],
  ["personio", "adjoe", "adjoe"],
  ["personio", "justtrack", "justtrack"],
  ["personio", "inno-games", "InnoGames"],
  ["greenhouse", "wooga", "Wooga"],
  ["personio", "kolibri-games", "Kolibri Games"],
  ["personio", "wunderflats", "Wunderflats"],
  ["personio", "habyt", "Habyt"],
  ["personio", "spotahome", "Spotahome"],
  ["personio", "getyourguide", "GetYourGuide"],
  ["personio", "bookingkit", "bookingkit"],
  ["personio", "bonify", "bonify"],
  ["personio", "auxmoney", "auxmoney"],
  ["personio", "smava", "smava"],
  ["personio", "creditshelf", "creditshelf"],
  ["personio", "bilendo", "Bilendo"],
  ["personio", "moss", "Moss"],
  ["personio", "pliant", "Pliant"],
  ["personio", "finway", "finway"],
  ["personio", "candis", "CANDIS"],
  ["personio", "finoa", "Finoa"],
  ["personio", "upvest", "Upvest"],
  ["personio", "ride-capital", "RIDE Capital"],
  ["recruitee", "sendcloud", "Sendcloud"],
  ["recruitee", "channable", "Channable"],
  ["recruitee", "sana-commerce", "Sana Commerce"],
  ["recruitee", "recruitee", "Recruitee"],
  ["recruitee", "teamleader", "Teamleader"],
  ["recruitee", "trengo", "Trengo"],
  ["recruitee", "bunq", "bunq"],
  ["recruitee", "mollie", "Mollie"],
  ["recruitee", "messagebird", "Bird"],
  ["recruitee", "hubs", "Hubs"],
  ["lever", "bloomon", "bloomon"],
  ["recruitee", "picnic", "Picnic"],
  ["greenhouse", "housinganywhere", "HousingAnywhere"],
  ["recruitee", "studocu", "Studocu"],
  ["recruitee", "mrmarvis", "MR MARVIS"],
  ["recruitee", "swapfiets", "Swapfiets"],
  ["recruitee", "felyx", "felyx"],
  ["recruitee", "parkos", "Parkos"],
  ["personio", "lepaya", "Lepaya"],
  ["smartrecruiters", "DeliveryHero", "Delivery Hero"],
  ["smartrecruiters", "Wolt", "Wolt"],
  ["smartrecruiters", "ScalableCapital", "Scalable Capital"],
  ["smartrecruiters", "ServiceNow", "ServiceNow"],
  ["smartrecruiters", "BoschGroup", "Bosch"],
  ["smartrecruiters", "Siemens", "Siemens"],
  ["smartrecruiters", "AUTO1Group", "AUTO1 Group"],
  ["smartrecruiters", "AVIVGroup", "AVIV Group"],
  ["smartrecruiters", "SIXT", "SIXT"],
  ["smartrecruiters", "Sportradar", "Sportradar"],
  ["smartrecruiters", "Ubisoft2", "Ubisoft"],
  ["smartrecruiters", "Gameloft", "Gameloft"],
  ["smartrecruiters", "Believe", "Believe"],
  ["smartrecruiters", "Deezer", "Deezer"],
  ["smartrecruiters", "Dailymotion", "Dailymotion"],
  ["smartrecruiters", "Visa", "Visa"],
  ["smartrecruiters", "Wise", "Wise"],
  ["smartrecruiters", "NielsenIQ", "NielsenIQ"],
  ["smartrecruiters", "PublicisGroupe", "Publicis Groupe"],
  ["smartrecruiters", "Accor", "Accor"],
  ["smartrecruiters", "IKEA", "IKEA"],
  ["smartrecruiters", "HM", "H&M"],
  ["smartrecruiters", "HoffmannGroup", "Hoffmann Group"],
  ["smartrecruiters", "BoozAllenHamilton", "Booz Allen Hamilton"],
  ["workable", "devoted-studios-1", "Devoted Studios"],
  ["workable", "getolo", "getolo"],
  ["workable", "joinbeam", "Beam AI"],
  ["workable", "hackthebox", "Hack The Box"],
  ["workable", "balena", "balena"],
  ["workable", "persado", "Persado"],
  ["workable", "learnworlds", "LearnWorlds"],
  ["workable", "learnupon", "LearnUpon"],
  ["workable", "talentlms", "TalentLMS"],
  ["workable", "bjak", "BJAK"],
  ["workable", "transifex", "Transifex"],
  ["workable", "netguru", "Netguru"],
  ["workable", "10up", "10up"],
  ["workable", "humanmade", "Human Made"],
  ["workable", "komoot", "komoot"],
  ["workable", "causal", "Causal"],
  ["workable", "nord-security", "Nord Security"],
  ["workable", "vinted", "Vinted"],
  ["workable", "triptease", "Triptease"],
  ["workable", "hostaway", "Hostaway"],
  ["workable", "zencargo", "Zencargo"]
];
const BOARD_WEB_FALLBACKS = {
  'recruitee:picnic':'https://jobs.picnic.app/en/',
  'recruitee:studocu':'https://jobs.studocu.com/',
  'recruitee:mrmarvis':'https://careers.mrmarvis.com/jobs',
  'recruitee:swapfiets':'https://jobs.swapfiets.com/',
  'recruitee:felyx':'https://felyx-1732008592.teamtailor.com/jobs',
  'recruitee:parkos':'https://jobs.parkos.com/jobs'
};
// A dated catalog audit is separate from runtime health. 404 feeds are paused; career websites still need research.
const BOARD_AUDIT = {"greenhouse:getyourguide":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:14:43Z","enabled":true},"greenhouse:parloa":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:14:43Z","enabled":true},"greenhouse:distrokid":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:14:43Z","enabled":true},"lever:spotify":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:14:43Z","enabled":true},"greenhouse:contentful":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:14:43Z","enabled":true},"greenhouse:n26":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:14:43Z","enabled":true},"greenhouse:hellofresh":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:14:43Z","enabled":true},"greenhouse:sumup":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:14:43Z","enabled":true},"greenhouse:flix":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:14:43Z","enabled":true},"greenhouse:soundcloud71":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:14:43Z","enabled":true},"greenhouse:sonymusicentertainment":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:14:43Z","enabled":true},"greenhouse:celonis":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:14:43Z","enabled":true},"greenhouse:datadog":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:14:43Z","enabled":true},"greenhouse:elastic":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:14:43Z","enabled":true},"greenhouse:grafanalabs":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:14:43Z","enabled":true},"greenhouse:gitlab":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:14:43Z","enabled":true},"greenhouse:canonical":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:14:48Z","enabled":true},"greenhouse:stripe":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:14:51Z","enabled":true},"greenhouse:adyen":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:14:52Z","enabled":true},"greenhouse:databricks":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:14:52Z","enabled":true},"greenhouse:mongodb":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:14:52Z","enabled":true},"greenhouse:cloudflare":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:14:52Z","enabled":true},"greenhouse:intercom":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:14:52Z","enabled":true},"greenhouse:airbnb":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:14:52Z","enabled":true},"greenhouse:wolt":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:14:52Z","enabled":true},"greenhouse:commercetools":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:14:52Z","enabled":true},"greenhouse:pendo":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:14:52Z","enabled":true},"greenhouse:figma":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:14:52Z","enabled":true},"greenhouse:anthropic":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:14:52Z","enabled":true},"greenhouse:discord":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:14:52Z","enabled":true},"greenhouse:reddit":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:14:52Z","enabled":true},"greenhouse:duolingo":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:14:52Z","enabled":true},"greenhouse:doctolib":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:14:52Z","enabled":true},"lever:aircall":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:00Z","enabled":true},"ashby:deepl":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:00Z","enabled":true},"ashby:n8n":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:00Z","enabled":true},"ashby:elevenlabs":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:00Z","enabled":true},"ashby:lovable":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:00Z","enabled":true},"ashby:linear":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:00Z","enabled":true},"ashby:notion":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:00Z","enabled":true},"ashby:openai":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:00Z","enabled":true},"ashby:ramp":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:00Z","enabled":true},"ashby:granola":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:00Z","enabled":true},"greenhouse:aiven":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:15:00Z","enabled":false},"greenhouse:algolia":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:00Z","enabled":true},"greenhouse:asana":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:00Z","enabled":true},"greenhouse:atlassian":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:15:01Z","enabled":false},"greenhouse:automattic":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:15:01Z","enabled":false},"greenhouse:avivgroup":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:15:01Z","enabled":false},"greenhouse:backmarket":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:15:05Z","enabled":false},"greenhouse:babbel":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:15:05Z","enabled":false},"greenhouse:betterup":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:15:05Z","enabled":false},"greenhouse:bitpanda":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:05Z","enabled":true},"greenhouse:brex":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:05Z","enabled":true},"greenhouse:carta":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:05Z","enabled":true},"greenhouse:checkr":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:05Z","enabled":true},"greenhouse:circleci":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:05Z","enabled":true},"greenhouse:cohere":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:15:05Z","enabled":false},"greenhouse:confluent":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:15:05Z","enabled":false},"greenhouse:contentsquare":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:15:05Z","enabled":false},"greenhouse:coursera":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:05Z","enabled":true},"greenhouse:dataminr":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:15:05Z","enabled":false},"greenhouse:dbt-labs":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:15:05Z","enabled":false},"greenhouse:deliveroo":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:05Z","enabled":true},"greenhouse:depop":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:15:08Z","enabled":true},"greenhouse:descript":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:15:09Z","enabled":true},"greenhouse:docker":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:15:09Z","enabled":true},"greenhouse:dropbox":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:15:09Z","enabled":true},"greenhouse:ecovadis":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:15:09Z","enabled":true},"greenhouse:edb":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:15:09Z","enabled":true},"greenhouse:exabeam":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:15:09Z","enabled":true},"greenhouse:fivetran":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:15:09Z","enabled":true},"greenhouse:flohealth":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:15:09Z","enabled":true},"greenhouse:forto":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:15:09Z","enabled":true},"greenhouse:gleanwork":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:15:09Z","enabled":true},"greenhouse:gocardless":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:15:09Z","enabled":true},"greenhouse:gongio":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:15:09Z","enabled":true},"greenhouse:goodnotes":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:15:09Z","enabled":true},"greenhouse:hightouch":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:15:09Z","enabled":true},"greenhouse:hubspot":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:15:09Z","enabled":true},"greenhouse:improbable":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:15:17Z","enabled":false},"greenhouse:influxdata":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:15:18Z","enabled":false},"greenhouse:instabase":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:15:18Z","enabled":false},"greenhouse:jellyfish":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:15:18Z","enabled":false},"greenhouse:klaviyo":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:18Z","enabled":true},"greenhouse:launchdarkly":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:18Z","enabled":true},"greenhouse:lattice":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:18Z","enabled":true},"greenhouse:lightspeedhq":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:15:18Z","enabled":false},"greenhouse:lucidsoftware":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:18Z","enabled":true},"greenhouse:marqeta":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:15:18Z","enabled":false},"greenhouse:miro":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:15:18Z","enabled":false},"greenhouse:mixpanel":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:18Z","enabled":true},"greenhouse:mollie":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:15:18Z","enabled":false},"greenhouse:mozilla":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:18Z","enabled":true},"greenhouse:netlify":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:18Z","enabled":true},"greenhouse:newrelic":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:18Z","enabled":true},"greenhouse:okta":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:23Z","enabled":true},"greenhouse:onetrust":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:23Z","enabled":true},"greenhouse:onfido":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:15:23Z","enabled":false},"greenhouse:optimizely":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:15:23Z","enabled":false},"greenhouse:pagerduty":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:23Z","enabled":true},"greenhouse:personio":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:15:23Z","enabled":false},"greenhouse:pinterest":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:23Z","enabled":true},"greenhouse:plaid":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:15:23Z","enabled":false},"greenhouse:postman":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:15:23Z","enabled":false},"greenhouse:project44":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:23Z","enabled":true},"greenhouse:remote":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:23Z","enabled":true},"greenhouse:retool":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:15:23Z","enabled":false},"greenhouse:rippling":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:15:23Z","enabled":false},"greenhouse:roku":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:23Z","enabled":true},"greenhouse:samsara":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:23Z","enabled":true},"greenhouse:scandit":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:23Z","enabled":true},"greenhouse:sentry":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:15:31Z","enabled":true},"greenhouse:similarweb":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:15:31Z","enabled":true},"greenhouse:smartsheet":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:15:31Z","enabled":true},"greenhouse:snyk":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:15:31Z","enabled":true},"greenhouse:sourcegraph":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:15:31Z","enabled":true},"greenhouse:stackadapt":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:15:31Z","enabled":true},"greenhouse:storyblok":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:15:31Z","enabled":true},"greenhouse:synthesia":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:15:31Z","enabled":true},"greenhouse:tanium":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:15:31Z","enabled":true},"greenhouse:tealium":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:15:31Z","enabled":true},"greenhouse:tenableinc":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:15:31Z","enabled":true},"greenhouse:thoughtspot":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:15:31Z","enabled":true},"greenhouse:twilio":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:15:31Z","enabled":true},"greenhouse:uipath":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:15:31Z","enabled":true},"greenhouse:unity3d":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:15:31Z","enabled":true},"greenhouse:vercel":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:15:31Z","enabled":true},"greenhouse:vimeo":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:15:40Z","enabled":false},"greenhouse:webflow":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:40Z","enabled":true},"greenhouse:workato":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:40Z","enabled":true},"greenhouse:zapier":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:15:40Z","enabled":false},"greenhouse:zuora":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:40Z","enabled":true},"ashby:ashby":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:40Z","enabled":true},"ashby:choco":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:40Z","enabled":true},"ashby:plancraft":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:40Z","enabled":true},"ashby:mirelo":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:40Z","enabled":true},"ashby:neara":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:40Z","enabled":true},"ashby:klim":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:40Z","enabled":true},"ashby:bunch":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:40Z","enabled":true},"ashby:lemon-markets":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:40Z","enabled":true},"ashby:almedia":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:40Z","enabled":true},"ashby:voize":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:40Z","enabled":true},"ashby:prior-labs":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:40Z","enabled":true},"ashby:voyfai":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:42Z","enabled":true},"ashby:cursor":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:42Z","enabled":true},"ashby:deel":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:42Z","enabled":true},"ashby:supabase":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:42Z","enabled":true},"ashby:perplexity":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:42Z","enabled":true},"ashby:huggingface":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:15:44Z","enabled":false},"ashby:modal":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:44Z","enabled":true},"ashby:dust":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:44Z","enabled":true},"ashby:synthflow":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:15:44Z","enabled":false},"ashby:qdrant":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:15:44Z","enabled":false},"ashby:langfuse":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:44Z","enabled":true},"ashby:calcom":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:15:44Z","enabled":false},"ashby:posthog":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:44Z","enabled":true},"ashby:incident":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:44Z","enabled":true},"ashby:attio":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:44Z","enabled":true},"ashby:clay":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:15:44Z","enabled":false},"ashby:mercury":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:44Z","enabled":true},"ashby:tines":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:15:44Z","enabled":false},"ashby:vanta":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:44Z","enabled":true},"ashby:sana":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:15:44Z","enabled":false},"ashby:raycast":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:44Z","enabled":true},"ashby:resend":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:15:53Z","enabled":true},"ashby:suno":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:15:53Z","enabled":true},"ashby:udio":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:15:53Z","enabled":true},"ashby:replit":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:15:53Z","enabled":true},"ashby:livekit":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:15:53Z","enabled":true},"ashby:cognition":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:15:53Z","enabled":true},"ashby:runway":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:15:53Z","enabled":true},"ashby:writer":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:15:53Z","enabled":true},"ashby:crusoe":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:15:53Z","enabled":true},"ashby:harvey":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:53Z","enabled":true},"ashby:baseten":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:53Z","enabled":true},"ashby:hex":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:15:53Z","enabled":true},"ashby:motherduck":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:53Z","enabled":true},"ashby:watershed":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:53Z","enabled":true},"ashby:polar":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:53Z","enabled":true},"ashby:legora":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:15:54Z","enabled":true},"lever:xsolla":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:02Z","enabled":true},"lever:bending-spoons":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:02Z","enabled":true},"lever:palantir":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:02Z","enabled":true},"lever:mistral":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:02Z","enabled":true},"lever:leonardo":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:02Z","enabled":true},"lever:fugamusic":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:02Z","enabled":true},"lever:amuse":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:02Z","enabled":true},"lever:landr":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:02Z","enabled":true},"lever:kobalt":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:02Z","enabled":true},"lever:merlin":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:02Z","enabled":true},"lever:quantcast":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:03Z","enabled":true},"lever:veeva":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:03Z","enabled":true},"lever:contentsquare":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:03Z","enabled":true},"lever:cognism":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:03Z","enabled":true},"lever:chaos":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:03Z","enabled":true},"lever:appsflyer":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:03Z","enabled":true},"lever:pipedrive":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:11Z","enabled":true},"lever:sonarsource":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:11Z","enabled":true},"lever:shippo":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:11Z","enabled":false},"lever:ledger":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:11Z","enabled":false},"lever:alan":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:11Z","enabled":false},"lever:qonto":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:11Z","enabled":true},"lever:payfit":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:11Z","enabled":false},"lever:pennylane":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:11Z","enabled":false},"lever:quora":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:11Z","enabled":false},"lever:welocalize":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:11Z","enabled":false},"lever:appen":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:12Z","enabled":true},"lever:keyrock":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:12Z","enabled":false},"lever:kraken":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:12Z","enabled":true},"lever:binance":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:12Z","enabled":true},"lever:chainalysis":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:12Z","enabled":false},"lever:bitmovin":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:12Z","enabled":false},"lever:omio":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:14Z","enabled":true},"lever:sennder":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:14Z","enabled":true},"lever:lime":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:14Z","enabled":true},"lever:mambu":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:14Z","enabled":true},"lever:zenjob":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:14Z","enabled":true},"lever:flink":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:14Z","enabled":true},"lever:malt":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:14Z","enabled":true},"personio:koro-handels-gmbh":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:14Z","enabled":true},"personio:spread-gmbh":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:14Z","enabled":true},"personio:deeploi":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:14Z","enabled":true},"personio:avow":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:14Z","enabled":true},"personio:exmox-gmbh":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:14Z","enabled":true},"personio:cambrium":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:14Z","enabled":true},"personio:1komma5grad":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:14Z","enabled":true},"personio:cloover":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:14Z","enabled":true},"personio:bliq":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:15Z","enabled":true},"personio:eye-able":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:21Z","enabled":true},"personio:roadsurfer":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:21Z","enabled":true},"personio:getolo":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:21Z","enabled":true},"personio:urban-sports-club":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:21Z","enabled":false},"personio:traderepublic":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:22Z","enabled":true},"personio:sevdesk":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:23Z","enabled":true},"personio:jtl-software":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:23Z","enabled":false},"personio:finleap":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:23Z","enabled":false},"personio:finleap-connect":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:23Z","enabled":true},"personio:scalable-capital":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:23Z","enabled":true},"personio:enpal":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:23Z","enabled":true},"personio:thermondo":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:23Z","enabled":true},"personio:zolar":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:23Z","enabled":false},"personio:ecoworks":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:23Z","enabled":false},"personio:elvah":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:23Z","enabled":true},"personio:vialytics":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:23Z","enabled":true},"personio:plan-a":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:25Z","enabled":false},"personio:climatiq":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:25Z","enabled":false},"personio:carbmee":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:25Z","enabled":true},"personio:leapsome":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:26Z","enabled":true},"personio:coachhub":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:27Z","enabled":false},"personio:kenjo":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:27Z","enabled":true},"personio:heyjobs":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:28Z","enabled":false},"workable:workmotion":{"audit_status":"deferred_provider_quota","audit_checked_at":"2026-10-08T11:16:28Z","enabled":true},"personio:lano":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:28Z","enabled":true},"personio:sofatutor":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:28Z","enabled":true},"personio:simpleclub":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:29Z","enabled":true},"personio:amboss":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:30Z","enabled":true},"personio:lingoda":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:30Z","enabled":true},"personio:edurino":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:30Z","enabled":true},"personio:ninjaone":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:30Z","enabled":false},"personio:limehome":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:32Z","enabled":true},"personio:holidu":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:32Z","enabled":true},"personio:home24":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:32Z","enabled":false},"personio:autodoc":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:32Z","enabled":false},"personio:rebuy":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:32Z","enabled":false},"personio:refurbed":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:32Z","enabled":false},"personio:recommerce":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:32Z","enabled":false},"personio:everdrop":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:33Z","enabled":true},"personio:air-up":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:34Z","enabled":false},"personio:foodspring":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:35Z","enabled":true},"personio:yfood":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:35Z","enabled":false},"personio:sunday-natural":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:35Z","enabled":false},"personio:maniko":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:36Z","enabled":true},"personio:wellster":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:36Z","enabled":false},"personio:clareandme":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:36Z","enabled":false},"personio:mimi-hearing-technologies":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:36Z","enabled":true},"personio:bettermarks":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:36Z","enabled":true},"personio:orderbird":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:36Z","enabled":true},"personio:channable":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:37Z","enabled":true},"personio:zenloop":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:37Z","enabled":false},"personio:superchat":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:37Z","enabled":true},"personio:charles":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:39Z","enabled":false},"personio:airfocus":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:39Z","enabled":false},"personio:awork":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:39Z","enabled":true},"personio:osapiens":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:39Z","enabled":false},"personio:sastrify":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:40Z","enabled":true},"personio:appinio":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:40Z","enabled":false},"personio:adjust":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:40Z","enabled":false},"personio:adjoe":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:40Z","enabled":false},"personio:justtrack":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:41Z","enabled":true},"personio:inno-games":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:41Z","enabled":false},"greenhouse:wooga":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:42Z","enabled":true},"personio:kolibri-games":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:42Z","enabled":false},"personio:wunderflats":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:43Z","enabled":true},"personio:habyt":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:43Z","enabled":false},"personio:spotahome":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:44Z","enabled":true},"personio:getyourguide":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:44Z","enabled":true},"personio:bookingkit":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:44Z","enabled":false},"personio:bonify":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:44Z","enabled":true},"personio:auxmoney":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:45Z","enabled":true},"personio:smava":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:45Z","enabled":true},"personio:creditshelf":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:45Z","enabled":false},"personio:bilendo":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:45Z","enabled":false},"personio:moss":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:46Z","enabled":true},"personio:pliant":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:46Z","enabled":false},"personio:finway":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:46Z","enabled":true},"personio:candis":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:47Z","enabled":true},"personio:finoa":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:48Z","enabled":true},"personio:upvest":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:48Z","enabled":false},"personio:ride-capital":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:48Z","enabled":false},"recruitee:sendcloud":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:49Z","enabled":false},"recruitee:channable":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:50Z","enabled":true},"recruitee:sana-commerce":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:50Z","enabled":false},"recruitee:recruitee":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:50Z","enabled":false},"recruitee:teamleader":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:50Z","enabled":false},"recruitee:trengo":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:50Z","enabled":false},"recruitee:bunq":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:51Z","enabled":true},"recruitee:mollie":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:51Z","enabled":false},"recruitee:messagebird":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:52Z","enabled":true},"recruitee:hubs":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:52Z","enabled":false},"lever:bloomon":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:53Z","enabled":true},"recruitee:picnic":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:53Z","enabled":false},"greenhouse:housinganywhere":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:53Z","enabled":true},"recruitee:studocu":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:53Z","enabled":false},"recruitee:mrmarvis":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:53Z","enabled":true},"recruitee:swapfiets":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:53Z","enabled":false},"recruitee:felyx":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:54Z","enabled":true},"recruitee:parkos":{"audit_status":"not_found","audit_checked_at":"2026-10-08T11:16:54Z","enabled":false},"personio:lepaya":{"audit_status":"unverified","audit_checked_at":"2026-10-08T11:16:54Z","enabled":true},"smartrecruiters:DeliveryHero":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:54Z","enabled":true},"smartrecruiters:Wolt":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:54Z","enabled":true},"smartrecruiters:ScalableCapital":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:54Z","enabled":true},"smartrecruiters:ServiceNow":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:55Z","enabled":true},"smartrecruiters:BoschGroup":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:56Z","enabled":true},"smartrecruiters:Siemens":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:56Z","enabled":true},"smartrecruiters:AUTO1Group":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:56Z","enabled":true},"smartrecruiters:AVIVGroup":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:57Z","enabled":true},"smartrecruiters:SIXT":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:57Z","enabled":true},"smartrecruiters:Sportradar":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:58Z","enabled":true},"smartrecruiters:Ubisoft2":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:58Z","enabled":true},"smartrecruiters:Gameloft":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:58Z","enabled":true},"smartrecruiters:Believe":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:58Z","enabled":true},"smartrecruiters:Deezer":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:58Z","enabled":true},"smartrecruiters:Dailymotion":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:58Z","enabled":true},"smartrecruiters:Visa":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:58Z","enabled":true},"smartrecruiters:Wise":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:58Z","enabled":true},"smartrecruiters:NielsenIQ":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:16:58Z","enabled":true},"smartrecruiters:PublicisGroupe":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:17:01Z","enabled":true},"smartrecruiters:Accor":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:17:01Z","enabled":true},"smartrecruiters:IKEA":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:17:01Z","enabled":true},"smartrecruiters:HM":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:17:01Z","enabled":true},"smartrecruiters:HoffmannGroup":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:17:01Z","enabled":true},"smartrecruiters:BoozAllenHamilton":{"audit_status":"verified","audit_checked_at":"2026-10-08T11:17:01Z","enabled":true},"workable:devoted-studios-1":{"audit_status":"deferred_provider_quota","audit_checked_at":"2026-10-08T11:17:01Z","enabled":true},"workable:getolo":{"audit_status":"deferred_provider_quota","audit_checked_at":"2026-10-08T11:17:01Z","enabled":true},"workable:joinbeam":{"audit_status":"deferred_provider_quota","audit_checked_at":"2026-10-08T11:17:01Z","enabled":true},"workable:hackthebox":{"audit_status":"deferred_provider_quota","audit_checked_at":"2026-10-08T11:17:01Z","enabled":true},"workable:balena":{"audit_status":"deferred_provider_quota","audit_checked_at":"2026-10-08T11:17:01Z","enabled":true},"workable:persado":{"audit_status":"deferred_provider_quota","audit_checked_at":"2026-10-08T11:17:01Z","enabled":true},"workable:learnworlds":{"audit_status":"deferred_provider_quota","audit_checked_at":"2026-10-08T11:17:01Z","enabled":true},"workable:learnupon":{"audit_status":"deferred_provider_quota","audit_checked_at":"2026-10-08T11:17:01Z","enabled":true},"workable:talentlms":{"audit_status":"deferred_provider_quota","audit_checked_at":"2026-10-08T11:17:01Z","enabled":true},"workable:bjak":{"audit_status":"deferred_provider_quota","audit_checked_at":"2026-10-08T11:17:01Z","enabled":true},"workable:transifex":{"audit_status":"deferred_provider_quota","audit_checked_at":"2026-10-08T11:17:01Z","enabled":true},"workable:netguru":{"audit_status":"deferred_provider_quota","audit_checked_at":"2026-10-08T11:17:01Z","enabled":true},"workable:10up":{"audit_status":"deferred_provider_quota","audit_checked_at":"2026-10-08T11:17:01Z","enabled":true},"workable:humanmade":{"audit_status":"deferred_provider_quota","audit_checked_at":"2026-10-08T11:17:01Z","enabled":true},"workable:komoot":{"audit_status":"deferred_provider_quota","audit_checked_at":"2026-10-08T11:17:01Z","enabled":true},"workable:causal":{"audit_status":"deferred_provider_quota","audit_checked_at":"2026-10-08T11:17:01Z","enabled":true},"workable:nord-security":{"audit_status":"deferred_provider_quota","audit_checked_at":"2026-10-08T11:17:01Z","enabled":true},"workable:vinted":{"audit_status":"deferred_provider_quota","audit_checked_at":"2026-10-08T11:17:01Z","enabled":true},"workable:triptease":{"audit_status":"deferred_provider_quota","audit_checked_at":"2026-10-08T11:17:01Z","enabled":true},"workable:hostaway":{"audit_status":"deferred_provider_quota","audit_checked_at":"2026-10-08T11:17:01Z","enabled":true},"workable:zencargo":{"audit_status":"deferred_provider_quota","audit_checked_at":"2026-10-08T11:17:01Z","enabled":true}};
const BOARDS = BOARD_ROWS.map((r,i)=>({provider:r[0],board:r[1],company:r[2],region:r[3] || "global",optional:i>=43}));
const DISCOVERY_SOURCES = [
  {provider:'remotive',name:'Remotive',max_pages:1,documentation:'https://github.com/remotive-com/remote-jobs-api',delay_hours:24},
  {provider:'arbeitnow',name:'Arbeitnow',max_pages:10,documentation:'https://www.arbeitnow.com/blog/job-board-api'},
  {provider:'jobicy',name:'Jobicy',max_pages:10,documentation:'https://jobicy.com/jobs-rss-feed',delay_hours:3,window_days:7}
];
const CONFIG_KEYS = ['EVIDENCE_FILE_ID','CHARTER_FILE_ID','TRACKER_SHEET_ID','TRACKER_RANGE','OUTPUT_FOLDER_ID'];
function norm(v) {return String(v || '').normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();}
function plain(v) {return String(v || '').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\s+/g,' ').trim();}
function canonical(url) {
  const m = String(url).trim().match(/^https?:\/\/([^/?#]+)([^?#]*)(?:\?([^#]*))?(?:#.*)?$/i);
  if (!m) throw new Error('Invalid vacancy URL');
  const ignored = new Set(['source','ref','refid','trackingid','gh_src','pid','lever-source','language']);
  const query = (m[3] || '').split('&').filter(Boolean).map(p => p.split('='))
    .filter(p => !p[0].startsWith('utm_') && !ignored.has(p[0].toLowerCase()))
    .map(p => p.join('=')).sort().join('&');
  return 'https://' + m[1].toLowerCase() + m[2].replace(/\/(application|apply)\/?$/,'').replace(/\/$/,'') + (query ? '?' + query : '');
}
function legacyVacancyId(url) {
  const u = canonical(url);
  let m = u.match(/[?&]gh_jid=([^&]+)/); if (m) return 'greenhouse:' + m[1];
  m = u.match(/[?&]ashby_jid=([^&]+)/); if (m) return 'ashby:' + m[1];
  m = u.match(/^https:\/\/[^/]*greenhouse\.io\/.*jobs\/(\d+)/); if (m) return 'greenhouse:' + m[1];
  m = u.match(/^https:\/\/[^/]*lever\.co\/[^?]+\/([^/?]+)(?:\?|$)/); if (m) return 'lever:' + m[1];
  m = u.match(/^https:\/\/[^/]*ashbyhq\.com\/[^?]+\/([^/?]+)(?:\?|$)/); if (m) return 'ashby:' + m[1];
  return '';
}
function legacyIdentities(job) {
  return [canonical(job.url),'role:' + norm(job.company) + '|' + norm(job.title),vacancyId(job.url),
    job.provider && job.id ? job.provider + ':' + job.id : ''].filter(Boolean);
}
function trackerKeys(rows) {
  const aliases = {company:['company','unternehmen'],title:['role title','role','position'],url:['source','url','quelle','job url'],status:['status']};
  let cols, header = -1;
  for (let i=0; i<Math.min(5,rows.length); i++) {
    const c = {}; Object.keys(aliases).forEach(k => c[k] = rows[i].findIndex(v => aliases[k].includes(norm(v))));
    if (Object.values(c).every(v => v>=0)) {cols=c;header=i;break;}
  }
  if (header<0) throw new Error('Tracker headers not recognized');
  const result = new Set();
  rows.slice(header+1).forEach(row => {
    const company = norm(row[cols.company]), title = norm(row[cols.title]);
    if (aliases.company.includes(company) || (!company && !title)) return;
    if (!company || !title) throw new Error('Incomplete tracker identity');
    result.add('role:' + company + '|' + title);
    (String(row[cols.url] || '').match(/https?:\/\/[^\s<>]+/g) || []).forEach(url => {
      result.add(canonical(url)); const id=vacancyId(url); if(id) result.add(id);
    });
  });
  return result;
}
function eligible(job) {
  if (/\btax\b|\bcorporate finance\b|\bfinance business partner\b|\bcompensation\b|\blearning business partner\b|\bwarehouse\b|\bbrand strategy\b|\bpartner sales\b|\bchannel sales\b/i.test(job.title)) return false;
  if (/\bintern(ship)?\b|\bworking student\b|\bjunior\b|\bentry[- ]level\b/.test(norm(job.title))) return false;
  if (!roleFamilies(job).length) return false;
  const location=norm(job.location);
  if (/\bremote\s*[-–:,(/ ]*\s*(us|usa|united states|canada|uk|united kingdom)\s*(only|exclusively)\b/.test(location)) return false;
  if (!/\b(germany|deutschland|berlin|hamburg|munich|münchen|frankfurt|cologne|köln|düsseldorf|dusseldorf|stuttgart|leipzig|dresden)\b|\bremote\b.*\b(europe|emea|eu|worldwide|anywhere|global)\b|\b(europe|emea|eu)\b.*\bremote\b/.test(location)) return false;
  return !/(must (?:be )?(?:fluent|proficient) in german|german (?:fluency|proficiency) is required|fluent german (?:is )?required|native[- ]level german (?:is )?required|fließende deutschkenntnisse|verhandlungssichere deutschkenntnisse|german (?:at|minimum) c[12])/i.test(norm(job.description));
}
function roleFamilies(job) {
  const groups={operations:/operations|\bops\b|operational excellence|operating model/i,strategy:/strategy|strategic|chief of staff|founder|\bcoo\b/i,
    delivery:/delivery|implementation|deployment/i,enablement:/enablement|transformation/i,platform:/partner|marketplace|platform operations/i,
    customer_leadership:/(?=.*(?:head|director|lead|vp))(?=.*customer success)/i,music_leadership:/(?=.*(?:head|director|lead|vp))(?=.*(?:music|product))/i};
  return Object.keys(groups).filter(k=>groups[k].test(job.title));
}
function legacyBoardUrl(board) {
  const token=encodeURIComponent(board.board);
  if(board.provider==='greenhouse') return 'https://boards-api.greenhouse.io/v1/boards/'+token+'/jobs';
  if(board.provider==='lever') return 'https://'+(board.region==='eu'?'api.eu.lever.co':'api.lever.co')+'/v0/postings/'+token;
  if(board.provider==='ashby') return 'https://api.ashbyhq.com/posting-api/job-board/'+token;
  throw new Error('Unknown board');
}
function legacyJobFrom(raw,board) {
  if(board.provider==='ashby') {
    if(raw.isListed!==true) return null;
    const id=vacancyId(raw.jobUrl).replace(/^ashby:/,'');
    if(!id) throw new Error('Missing Ashby identity');
    const locations=[raw.location].concat((raw.secondaryLocations || []).map(x=>x.location));
    const country=((raw.address || {}).postalAddress || {}).addressCountry;
    if(country==='DE' || country==='Germany') locations.push('Germany');
    return {id:id,provider:'ashby',board:board,company:board.company,title:raw.title,url:raw.jobUrl,
      location:(raw.isRemote?'Remote ':'')+locations.filter(Boolean).join('; '),description:plain(raw.descriptionHtml || raw.descriptionPlain),published_at:raw.publishedAt || ''};
  }
  if(board.provider==='greenhouse') {
    if(raw.internal_job_id == null) return null;
    return {id:String(raw.id),provider:board.provider,board:board,company:board.company,title:raw.title,url:raw.absolute_url,location:(raw.location || {}).name || '',description:plain(raw.content)};
  }
  return {id:String(raw.id),provider:board.provider,board:board,company:board.company,title:raw.text,url:raw.hostedUrl,
    location:(raw.categories || {}).location || '',description:plain([raw.description,(raw.lists || []).map(x=>x.text+' '+x.content).join(' '),raw.additional,raw.workplaceType].filter(Boolean).join(' '))};
}
function fetchResponse(url,options,allowMissing) {
  for(let i=0;i<3;i++) {
    checkBudget();
    const r=UrlFetchApp.fetch(url,Object.assign({muteHttpExceptions:true},options || {})); const code=r.getResponseCode();
    if(allowMissing && [404,410].includes(code)) return null;
    if(code>=200 && code<300) return r;
    if(code!==429 && code<500) throw new Error('Request HTTP '+code);
    if(i<2) Utilities.sleep(Math.pow(2,i)*1000);
  }
  throw new Error('Request retry limit');
}
function googleRequest(url,options,allowMissing) {
  const o=Object.assign({},options || {});
  o.headers=Object.assign({},o.headers || {},{Authorization:'Bearer '+ScriptApp.getOAuthToken()});
  return fetchResponse(url,o,allowMissing);
}
function meta(id) {
  return JSON.parse(googleRequest('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(id)+'?fields=id,mimeType,trashed').getContentText());
}
function checkSource(id) {
  const info=meta(id); if(info.trashed) throw new Error('Source unavailable');
  const url='https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(id);
  let text,paragraphs;
  if(info.mimeType==='application/vnd.google-apps.document') text=googleRequest(url+'/export?mimeType=text%2Fplain').getContentText();
  else if(info.mimeType==='application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const blob=googleRequest(url+'?alt=media').getBlob().setContentType('application/zip');
    const entry=Utilities.unzip(blob).find(b=>b.getName()==='word/document.xml');
    if(!entry) throw new Error('Invalid DOCX source');
    // Preserve paragraph boundaries and qualifiers; stripping the whole XML
    // would merge unrelated facts and allow a short quote to hide limitations.
    const xml=entry.getDataAsString();
    if(xml.length>5000000) throw new Error('Source too large');
    const ns=XmlService.getNamespace('w','http://schemas.openxmlformats.org/wordprocessingml/2006/main');
    const root=XmlService.parse(xml).getRootElement();paragraphs=[];
    function visit(element) {
      if(element.getName()==='p' && element.getNamespace().getURI()===ns.getURI()) {
        const parts=[];
        function collect(e) {if(e.getName()==='t' && e.getNamespace().getURI()===ns.getURI())parts.push(e.getText());e.getChildren().forEach(collect);}
        collect(element);paragraphs.push(parts.join(''));return;
      }
      element.getChildren().forEach(visit);
    }
    visit(root);text=paragraphs.join('\n');
  } else if(['text/plain','text/markdown'].includes(info.mimeType)) text=googleRequest(url+'?alt=media').getContentText();
  else throw new Error('Unsupported source type');
  if(text.length<100) throw new Error('Source empty');
  return paragraphs || text.split(/\r?\n/);
}
function outputFiles(folder,name) {
  if(!/^[\w-]+$/.test(folder)) throw new Error('Invalid folder');
  const q="'"+folder+"' in parents and name = '"+name+"' and trashed = false";
  const body=JSON.parse(googleRequest('https://www.googleapis.com/drive/v3/files?q='+encodeURIComponent(q)+'&fields=files(id),nextPageToken&pageSize=100').getContentText());
  if(body.nextPageToken || body.files.length>1) throw new Error('Ambiguous output state');
  return body.files;
}
function readState(config) {
  const files=outputFiles(config.OUTPUT_FOLDER_ID,'processed_jobs.json');
  if(!files.length) return {version:1,processed:{},pending_review:{}};
  const state=JSON.parse(googleRequest('https://www.googleapis.com/drive/v3/files/'+files[0].id+'?alt=media').getContentText());
  if(state.version!==1 || !state.processed || typeof state.processed!=='object') throw new Error('Invalid state');
  // Upgrade legacy runs using the last report, so an existing ten-page crawl resumes.
  if(!state.feed_progress || !state.discovery_review) {
    const needsProgress=!state.feed_progress;state.feed_progress=state.feed_progress || {};state.discovery_review=state.discovery_review || {};
    const reports=outputFiles(config.OUTPUT_FOLDER_ID,'candidates.json');
    if(reports.length) {
      const report=JSON.parse(googleRequest('https://www.googleapis.com/drive/v3/files/'+reports[0].id+'?alt=media').getContentText());
      const prior=(report.discovery_sources || []).find(s=>s.source==='Arbeitnow');
      if(needsProgress && prior && prior.truncated===true) {
        const next=prior.next_backlog_page || (prior.pages+1);
        if(Number.isSafeInteger(next) && next>=4 && next<=1000000) state.feed_progress.arbeitnow={next_page:next,cycles_completed:0};
      }
      (report.discovery_leads || []).forEach(j=>{if(j.provider && j.id && j.requires_employer_verification===true) state.discovery_review[j.provider+':'+j.id]=Object.assign({},j,{source_last_seen_at:j.source_last_seen_at || report.checked_at || null});});
    }
  }
  return state;
}
function writeOutput(config,name,content,mime) {
  if(!['candidates.json','candidates.md','processed_jobs.json'].includes(name)) throw new Error('Unapproved output');
  const folder=meta(config.OUTPUT_FOLDER_ID);
  if(folder.trashed || folder.mimeType!=='application/vnd.google-apps.folder') throw new Error('Output folder unavailable');
  const files=outputFiles(config.OUTPUT_FOLDER_ID,name); let id;
  if(files.length) id=files[0].id;
  else id=JSON.parse(googleRequest('https://www.googleapis.com/drive/v3/files?fields=id',{method:'post',contentType:'application/json',payload:JSON.stringify({name:name,mimeType:mime,parents:[config.OUTPUT_FOLDER_ID]})}).getContentText()).id;
  if([config.EVIDENCE_FILE_ID,config.CHARTER_FILE_ID,config.TRACKER_SHEET_ID].includes(id)) throw new Error('Refusing source write');
  googleRequest('https://www.googleapis.com/upload/drive/v3/files/'+id+'?uploadType=media',{method:'patch',contentType:mime,payload:content});
}
function leadFrom(raw,source) {
  let job;
  if(source.provider==='remotive') job={id:String(raw.id),company:raw.company_name,title:raw.title,url:raw.url,location:'Remote '+raw.candidate_required_location,description:plain(raw.description),published_at:raw.publication_date};
  else if(source.provider==='arbeitnow') job={id:raw.slug,company:raw.company_name,title:raw.title,url:raw.url,location:(raw.remote?'Remote ':'')+raw.location,description:plain(raw.description),published_at:new Date(raw.created_at*1000).toISOString()};
  else if(source.provider==='jobicy') job={id:String(raw.id),company:raw.companyName,title:plain(raw.jobTitle),url:raw.url,location:'Remote '+raw.jobGeo,description:plain(raw.jobDescription),published_at:raw.pubDate};
  else throw new Error('Unknown discovery source');
  if(!job.id || !job.company || !job.title || !job.url) throw new Error('Incomplete discovery record');
  canonical(job.url);
  const html=raw.description || raw.jobDescription || '';
  const refs=(String(html).match(/https:\/\/[^\s<>"']+/g) || []).filter(url=>boardFromUrl(url,job.company));
  return Object.assign(job,{provider:source.provider,source:source.name,employer_live_verified:false,requires_employer_verification:true,source_delay_hours:source.delay_hours || null,role_families:roleFamilies(job),employer_references:refs});
}
function discoverArbeitnow(source,progress) {
  const prior=progress || {},saved=prior.next_page==null?4:prior.next_page;
  if(!Number.isSafeInteger(saved) || saved<4 || saved>1000000 || source.max_pages<4) throw new Error('Invalid crawl checkpoint');
  const visited=[],seen=new Set();let jobs=[],hasMore=true,backlogStart=Math.max(4,saved-1),nextPage=backlogStart;
  function readPage(page) {
    const body=JSON.parse(fetchResponse('https://www.arbeitnow.com/api/job-board-api?page='+page).getContentText());
    if(!Array.isArray(body.data) || !body.meta || Number(body.meta.current_page)!==page || !body.links) throw new Error('Invalid page metadata');
    hasMore=!!body.links.next;
    if(hasMore && body.links.next!=='https://www.arbeitnow.com/api/job-board-api?page='+(page+1)) throw new Error('Unexpected next page');
    // Convert the entire page before committing any progress.
    const converted=body.data.map(r=>leadFrom(r,source));visited.push(page);
    converted.forEach(j=>{if(!seen.has(j.id)){seen.add(j.id);jobs.push(j);}});
  }
  // New listings every day, plus a persistent historical sweep with one-page overlap.
  for(let page=1;page<=3 && hasMore;page++) readPage(page);
  while(hasMore && visited.length<source.max_pages) {readPage(nextPage);nextPage++;}
  const finished=!hasMore;
  const checkpoint={next_page:finished?4:nextPage,cycles_completed:Number(prior.cycles_completed || 0)+(finished?1:0),last_pages:visited,last_checked_at:new Date().toISOString()};
  return {jobs:jobs,pages:visited.length,pages_visited:visited,truncated:!finished,checkpoint:checkpoint,cycle_finished:finished,backlog_start:backlogStart};
}
function discoverFeed(source,progress) {
  if(source.provider==='arbeitnow') return discoverArbeitnow(source,progress);
  let jobs=[],cursor=null,hasMore=false;const cursors=new Set();
  for(let page=1;page<=source.max_pages;page++) {
    let url;
    if(source.provider==='remotive') url='https://remotive.com/api/remote-jobs';
    else if(source.provider==='arbeitnow') url='https://www.arbeitnow.com/api/job-board-api?page='+page;
    else url='https://jobicy.com/api/v2/remote-jobs?count=200'+(cursor?'&cursor='+encodeURIComponent(cursor):'');
    const body=JSON.parse(fetchResponse(url).getContentText());
    const rows=source.provider==='arbeitnow'?body.data:body.jobs;
    if(!Array.isArray(rows) || body.success===false) throw new Error('Invalid discovery feed');
    if(source.provider==='remotive' && body['job-count']!==rows.length) throw new Error('Incomplete remote feed');
    if(source.provider==='arbeitnow') {
      if(!body.meta || Number(body.meta.current_page)!==page || !body.links) throw new Error('Invalid page metadata');
      hasMore=!!body.links.next;
      if(hasMore && body.links.next!=='https://www.arbeitnow.com/api/job-board-api?page='+(page+1)) throw new Error('Unexpected next page');
    } else if(source.provider==='jobicy') {
      if(body.jobCount!==rows.length || typeof body.hasMore!=='boolean') throw new Error('Invalid cursor metadata');
      cursor=body.nextCursor;hasMore=body.hasMore;
      if(hasMore && (typeof cursor!=='string' || cursor.length>2048 || cursors.has(cursor))) throw new Error('Invalid cursor');
      if(!hasMore && cursor) throw new Error('Inconsistent cursor');
      if(cursor) cursors.add(cursor);
    } else hasMore=false;
    jobs=jobs.concat(rows.map(r=>leadFrom(r,source)));
    if(!hasMore) return {jobs:jobs,pages:page,truncated:false};
  }
  return {jobs:jobs,pages:source.max_pages,truncated:hasMore};
}
function legacyBoardFromUrl(url,company) {
  let m=String(url).match(/^https:\/\/(?:boards|job-boards)\.greenhouse\.io\/([\w-]+)\/jobs\/\d+/i);
  if(m) return {provider:'greenhouse',board:m[1],company:company};
  m=String(url).match(/^https:\/\/jobs(\.eu)?\.lever\.co\/([\w-]+)\/[^/?#]+/i);
  if(m) return {provider:'lever',board:m[2],company:company,region:m[1]?'eu':'global'};
  m=String(url).match(/^https:\/\/jobs\.ashbyhq\.com\/([\w-]+)\/[^/?#]+/i);
  if(m) return {provider:'ashby',board:m[1],company:company};
  return null;
}
function marketDiscovery(tracked,knownJobs,state) {
  const leads=[],stats=[],errors=[],seen=new Set(tracked),suggested=[];
  const priorIdentities=new Set();Object.values(state.discovery_review || {}).forEach(j=>identities(j).forEach(k=>priorIdentities.add(k)));
  Object.values(knownJobs).forEach(j=>identities(j).forEach(k=>seen.add(k)));
  const knownBoards=new Set(BOARDS.concat(state.discovered_boards || []).map(b=>b.provider+':'+b.board.toLowerCase()));
  const progress=state.feed_progress || {};state.feed_progress=progress;
  DISCOVERY_SOURCES.forEach(source=>{
    if(timeLow()) {stats.push({source:source.name,status:"deferred_time_budget"});return;}
    try {
      const feed=discoverFeed(source,progress[source.provider]);let matched=0,kept=0,newLeads=0;const families={};
      feed.jobs.forEach(j=>{
        if(!eligible(j)) return;matched++;j.role_families.forEach(k=>families[k]=(families[k] || 0)+1);
        const keys=identities(j);if(keys.some(k=>seen.has(k))) return;
        if(!keys.some(k=>priorIdentities.has(k))) newLeads++;
        keys.forEach(k=>seen.add(k));j.source_last_seen_at=new Date().toISOString();leads.push(j);kept++;
        const urls=[j.url].concat(j.employer_references || []);
        urls.forEach(url=>{const board=boardFromUrl(url,j.company);if(!board) return;
          const key=board.provider+':'+board.board.toLowerCase();if(!knownBoards.has(key)){knownBoards.add(key);suggested.push(board);}
        });
      });
      if(feed.checkpoint) progress[source.provider]=feed.checkpoint;
      stats.push({source:source.name,postings:feed.jobs.length,companies:new Set(feed.jobs.map(j=>norm(j.company))).size,pages:feed.pages,pages_visited:feed.pages_visited || null,truncated:feed.truncated,next_backlog_page:feed.checkpoint?feed.checkpoint.next_page:null,cycle_finished:feed.cycle_finished || false,role_location_matches:matched,role_families:families,new_leads:newLeads,refreshed_leads:kept-newLeads});
    } catch(e) {if(e.message==='TimeBudget') {stats.push({source:source.name,status:'deferred_time_budget'});return;} errors.push(Object.assign({stage:'discovery',board:source.provider},diagnostic(e.message)));stats.push({source:source.name,status:'error'});}
  });
  // These are public ATS references, not trusted evidence or fit decisions.
  state.discovered_boards=(state.discovered_boards || []).concat(suggested);
  Object.values(state.discovery_review || {}).forEach(j=>{
    const keys=identities(j);
    if(!eligible(j) || keys.some(k=>seen.has(k))) return;
    keys.forEach(k=>seen.add(k));leads.push(Object.assign({},j,{employer_live_verified:false,requires_employer_verification:true}));
  });
  state.discovery_review=Object.fromEntries(leads.map(j=>[j.provider+':'+j.id,j]));
  return {leads:leads,stats:stats,errors:errors,new_boards:suggested.length};
}
function enableDailyScan() {
  // Run only after scanJobs succeeds and the previous GitHub scheduler is disabled.
  if(ScriptApp.getProjectTriggers().some(t=>t.getHandlerFunction()==='scanJobs')) throw new Error('Daily trigger already exists');
  ScriptApp.newTrigger('scanJobs').timeBased().atHour(9).everyDays(1).inTimezone('Europe/Berlin').create();
  console.log('Daily scan enabled between 09:00 and 10:00 Berlin time.');
}
function initializeOutputFolder() {
  const props=PropertiesService.getScriptProperties(), config=props.getProperties();
  if(config.APPS_SCRIPT_OUTPUT_READY==='true') return;
  CONFIG_KEYS.forEach(k=>{if(!config[k]) throw new Error('Missing configuration: '+k);});
  checkSource(config.EVIDENCE_FILE_ID);checkSource(config.CHARTER_FILE_ID);
  const state=readState(config);
  // drive.file cannot edit files created by the earlier desktop OAuth client.
  // Create this script's own private folder and carry its pending queue forward.
  const folder=JSON.parse(googleRequest('https://www.googleapis.com/drive/v3/files?fields=id',{
    method:'post',contentType:'application/json',payload:JSON.stringify({name:'JobOps — private daily collection',mimeType:'application/vnd.google-apps.folder'})
  }).getContentText());
  config.OUTPUT_FOLDER_ID=folder.id;
  writeOutput(config,'processed_jobs.json',JSON.stringify(state,null,2),'application/json');
  props.setProperty('OUTPUT_FOLDER_ID',folder.id);props.setProperty('APPS_SCRIPT_OUTPUT_READY','true');
  console.log('Private output folder: https://drive.google.com/drive/folders/'+folder.id);
}


// Script Properties: BOARD_BATCH_SIZE (80), FETCH_BATCH_SIZE (8),
// SCAN_BUDGET_MS (270000), BOARD_PAGE_LIMIT (3). Output reserve is 90 seconds.
let RUN_CLOCK=null, RUN_CACHE={};
function setting(config,key,fallback,min,max) {const n=Number(config[key]);return Number.isInteger(n)&&n>=min&&n<=max?n:fallback;}
function timeLow() {return !!RUN_CLOCK && Date.now()-RUN_CLOCK.start>=RUN_CLOCK.budget;}
function checkBudget() {if(timeLow()) throw new Error('TimeBudget');}
function boardKey(b) {return b.provider+':'+b.board.toLowerCase()+':'+(b.region || 'global');}
function vacancyId(url) {
  const u=canonical(url);let m;
  m=u.match(/^https:\/\/([\w-]+)\.jobs\.personio\.(?:de|com)\/job\/(\d+)/i);
  if(m) return 'personio:'+m[1].toLowerCase()+':'+m[2];
  m=u.match(/^https:\/\/([\w-]+)\.recruitee\.com\/o\/([^/?]+)/i);
  if(m) return 'recruitee-url:'+m[1].toLowerCase()+':'+m[2];
  m=u.match(/^https:\/\/jobs\.smartrecruiters\.com\/[^/]+\/(\d+)(?:-|$)/i);
  if(m) return 'smartrecruiters:'+m[1];
  m=u.match(/^https:\/\/apply\.workable\.com\/(?:[\w-]+\/)?j\/([^/?]+)/i);
  if(m) return 'workable:'+m[1];
  return legacyVacancyId(url);
}
function identities(job) {
  const out=[canonical(job.url),'role:'+norm(job.company)+'|'+norm(job.title),vacancyId(job.url)];
  if(job.provider && job.id) out.push(['personio','recruitee'].includes(job.provider)?job.provider+':'+job.board.board.toLowerCase()+':'+job.id:job.provider+':'+job.id);
  return out.filter(Boolean);
}
function jobKey(j) {return ['personio','recruitee'].includes(j.provider)?j.provider+':'+j.board.board.toLowerCase()+':'+j.id:j.provider+':'+j.id;}
function boardUrl(b) {
  const t=encodeURIComponent(b.board);
  if(!/^[\w-]+$/.test(b.board)) throw new Error('Invalid board slug');
  if(b.provider==='personio') return 'https://'+b.board+'.jobs.personio.'+(b.domain==='com'?'com':'de')+'/xml?language=en';
  if(b.provider==='recruitee') return 'https://'+b.board+'.recruitee.com/api/offers/';
  if(b.provider==='smartrecruiters') return 'https://api.smartrecruiters.com/v1/companies/'+t+'/postings';
  if(b.provider==='workable') return 'https://www.workable.com/api/accounts/'+t+'?details=true';
  return legacyBoardUrl(b);
}
function countryName(c) {return /^de$/i.test(c || '')?'Germany':String(c || '');}
function jobFrom(raw,b) {
  if(['greenhouse','lever','ashby'].includes(b.provider)) return legacyJobFrom(raw,b);
  let id,title,url,location,description,published;
  if(b.provider==='personio') {
    id=raw.id;title=raw.name;location=raw.office;description=raw.description;published=raw.createdAt;
    url='https://'+b.board+'.jobs.personio.'+(b.domain==='com'?'com':'de')+'/job/'+id;
  } else if(b.provider==='recruitee') {
    if(raw.status && !['published','open'].includes(raw.status)) return null;
    id=raw.id;title=raw.title;url=raw.careers_url || ('https://'+b.board+'.recruitee.com/o/'+raw.slug);
    const loc=(raw.locations || []).map(l=>[l.city,countryName(l.country)].filter(Boolean).join(', '));
    location=[raw.city,countryName(raw.country),raw.location].filter(Boolean).join('; ');
    if(loc.length) location=loc.join('; ');
    if(raw.remote || raw.is_remote) location='Remote '+location;
    description=[raw.description,raw.requirements].filter(Boolean).join(' ');published=raw.published_at;
  } else if(b.provider==='smartrecruiters') {
    if(raw.active===false) return null;
    id=raw.id;title=raw.name;const l=raw.location || {};
    location=(l.remote?'Remote ':'')+[l.city,l.region,countryName(l.country)].filter(Boolean).join(', ');
    url=raw.postingUrl || 'https://jobs.smartrecruiters.com/'+b.board+'/'+id;
    description=Object.values((raw.jobAd || {}).sections || {}).map(x=>x.text || '').join(' ');published=raw.releasedDate;
  } else if(b.provider==='workable') {
    id=raw.shortcode || raw.code;title=raw.title;
    url=raw.shortlink || raw.application_url || raw.url || ('https://apply.workable.com/'+b.board+'/j/'+id);
    location=(raw.telecommuting || raw.workplace_type==='remote'?'Remote ':'')+[raw.city,raw.state,countryName(raw.country)].filter(Boolean).join(', ');
    description=raw.description;published=raw.published_on;
  } else throw new Error('Unknown provider');
  if(!id || !title || !url) throw new Error('Invalid posting');
  return {id:String(id),provider:b.provider,board:b,company:b.company,title:title,url:canonical(url),location:location || '',description:plain(description),published_at:published || ''};
}
function personioRows(text) {
  const root=XmlService.parse(text).getRootElement();
  if(root.getName()!=='workzag-jobs') throw new Error('Invalid Personio XML');
  return root.getChildren('position').map(p=>{
    const get=n=>p.getChildText(n) || '';
    const blocks=p.getChild('jobDescriptions');
    return {id:get('id'),name:get('name'),office:[get('office'),...(p.getChild('additionalOffices')?p.getChild('additionalOffices').getChildren().map(x=>x.getText()):[])].filter(Boolean).join('; '),createdAt:get('createdAt'),description:blocks?blocks.getChildren('jobDescription').map(x=>(x.getChildText('name') || '')+' '+(x.getChildText('value') || '')).join(' '):''};
  });
}
function listingUrl(b,page) {
  const u=boardUrl(b);
  if(b.provider==='lever') return u+'?mode=json&limit=100&skip='+page*100;
  if(b.provider==='smartrecruiters') return u+'?limit=100&offset='+page*100;
  return u;
}
function listingResponse(r,b,page) {
  const body=b.provider==='personio'?null:JSON.parse(r.getContentText());let rows,more=false;
  if(b.provider==='personio') rows=personioRows(r.getContentText());
  else if(b.provider==='lever') {rows=body;more=Array.isArray(rows)&&rows.length===100;}
  else if(b.provider==='recruitee') rows=body.offers;
  else if(b.provider==='smartrecruiters') {rows=body.content;if(!Number.isInteger(body.totalFound)) throw new Error('Missing posting count');more=(page*100+(rows || []).length)<body.totalFound;if(more && !rows.length) throw new Error('Empty pagination page');}
  else rows=body.jobs;
  if(!Array.isArray(rows)) throw new Error('Invalid listing');
  if(b.provider==='greenhouse' && body.meta && body.meta.total!=null && body.meta.total!==rows.length) throw new Error('Incomplete listing');
  return {jobs:rows.map(raw=>jobFrom(raw,b)).filter(Boolean),more:more};
}
// One bad HTTP response is isolated. A fetchAll transport failure falls back
// to individual fetches only while time remains; no long retry sleeps here.
function parallelFetch(urls) {
  checkBudget();
  if(urls.some(u=>u.indexOf('https://www.workable.com/api/accounts/')===0)) {return urls.map(u=>{try {checkBudget();if(u.indexOf('https://www.workable.com/api/accounts/')===0 && RUN_WORKABLE_UNTIL>Date.now()) return {error:'ProviderCooldown'};if(u.indexOf('https://www.workable.com/api/accounts/')===0 && RUN_WORKABLE_REQUESTS>=2) return {error:'ProviderQuota'};if(u.indexOf('https://www.workable.com/api/accounts/')===0) RUN_WORKABLE_REQUESTS++;const response=UrlFetchApp.fetchAll([{url:u,muteHttpExceptions:true,followRedirects:true}])[0];if(u.indexOf('https://www.workable.com/api/accounts/')===0 && response.getResponseCode()===429) RUN_WORKABLE_UNTIL=Date.now()+3600000;return {response:response};}catch(e){return {error:e.message==='TimeBudget'?'TimeBudget':'TransportError'};}});}
  try {return UrlFetchApp.fetchAll(urls.map(url=>({url:url,muteHttpExceptions:true,followRedirects:true}))).map(r=>({response:r}));}
  catch(e) {return urls.map(url=>{if(timeLow()) return {error:'TimeBudget'};try{return {response:UrlFetchApp.fetch(url,{muteHttpExceptions:true})};}catch(x){return {error:'TransportError'};}});}
}
function requireResponse(item,allowMissing) {
  if(item.error) throw new Error(item.error);
  const code=item.response.getResponseCode();
  if(allowMissing && [404,410].includes(code)) return null;
  if(code<200 || code>=300) throw new Error('HTTP '+code);
  return item.response;
}
function discover(b) {
  let jobs=[];
  for(let page=0;page<100;page++) {checkBudget();const r=fetchResponse(listingUrl(b,page),{},true);if(!r) return [];const p=listingResponse(r,b,page);jobs=jobs.concat(p.jobs);if(!p.more) return jobs;}
  throw new Error('Pagination limit');
}
let RUN_WORKABLE_UNTIL=0,RUN_WORKABLE_REQUESTS=0;
const COLLECTOR_VERSION = '2026-10-08-recovery-2';
function diagnostic(reason) {
  const text=String(reason || 'Unknown error'),m=text.match(/HTTP (\d+)/),code=m?Number(m[1]):null;
  const type=text==='TimeBudget'?'time_budget':['ProviderCooldown','ProviderQuota'].includes(text)?'provider_cooldown':code===404||code===410?'not_found':code===401||code===403?'access_denied':code===429?'rate_limited':code>=500?'server_error':text==='TransportError'?'transport_error':text==='JD incomplete'?'incomplete_jd':/Identity mismatch/.test(text)?'identity_mismatch':/JSON|listing|posting count|pagination|XML/i.test(text)?'invalid_response':'provider_error';
  return {error_type:type,http_status:code,reason:text.slice(0,200),retryable:['rate_limited','server_error','transport_error','time_budget','provider_cooldown','incomplete_jd'].includes(type)};
}
function recordBoardHealth(state,b,event) {
  state.board_health=state.board_health || {};
  const key=boardKey(b),h=state.board_health[key] || {consecutive_failures:0};
  Object.assign(h,{company:b.company,provider:b.provider,board:b.board,url:boardUrl(b),last_attempt_at:new Date().toISOString(),status:event.status});
  if(['ok','page_checkpoint'].includes(event.status)) {h.last_page_success_at=h.last_attempt_at;if(event.status==='ok') h.last_success_at=h.last_attempt_at;h.consecutive_failures=0;delete h.failure;}
  else if(event.status==='unavailable') {h.consecutive_failures++;h.failure=diagnostic(event.reason);}
  state.board_health[key]=h;return event;
}
function coverageSnapshot(all,state,stats) {
  const inventory=all.map(b=>Object.assign({key:boardKey(b),company:b.company,provider:b.provider,board:b.board,url:boardUrl(b),web_fallback_url:BOARD_WEB_FALLBACKS[b.provider+':'+b.board] || null},BOARD_AUDIT[boardKey(b)] || {},(state.board_health || {})[boardKey(b)] || {}));
  return {collector_version:COLLECTOR_VERSION,inventory:inventory,boards_completed_this_run:new Set(stats.filter(s=>s.status==='ok').map(s=>s.board)).size,boards_with_page_success_this_run:new Set(stats.filter(s=>['ok','page_checkpoint'].includes(s.status)).map(s=>s.board)).size,never_completed:inventory.filter(b=>!b.last_success_at).map(b=>b.key),unavailable_this_run:Array.from(new Set(stats.filter(s=>s.status==='unavailable').map(s=>s.board)))};
}

function collectBoards(boards,state,config,tracked,errors,stats) {
  state.board_progress=state.board_progress || {};let tasks=boards.map(b=>({b:b,page:Number((state.board_progress[boardKey(b)] || {}).page || 0),round:0}));
  const size=setting(config,'FETCH_BATCH_SIZE',8,1,20),pageLimit=setting(config,'BOARD_PAGE_LIMIT',3,1,20);
  while(tasks.length && !timeLow()) {
    const batch=tasks.splice(0,size),results=parallelFetch(batch.map(t=>listingUrl(t.b,t.page)));
    batch.forEach((t,i)=>{
      const k=boardKey(t.b);
      try {
        const r=requireResponse(results[i],true);if(!r) {stats.push(recordBoardHealth(state,t.b,Object.assign({board:k,status:'unavailable'},diagnostic('HTTP '+results[i].response.getResponseCode()))));delete state.board_progress[k];return;}
        const parsed=listingResponse(r,t.b,t.page);
        if(!t.page && !parsed.more) RUN_CACHE[k]=parsed.jobs;
        parsed.jobs.forEach(j=>{if(eligible(j) && !identities(j).some(x=>tracked.has(x))) {const key=jobKey(j),previous=state.pending_review[key];state.pending_review[key]=Object.assign({},j,{live_checked_at:previous?previous.live_checked_at:undefined});}});
        if(parsed.more) {state.board_progress[k]={page:t.page+1};if(t.round+1<pageLimit) tasks.push({b:t.b,page:t.page+1,round:t.round+1});}
        else delete state.board_progress[k];
        stats.push(recordBoardHealth(state,t.b,{board:k,status:parsed.more?'page_checkpoint':'ok',page:t.page,postings:parsed.jobs.length}));
      } catch(e) {stats.push(recordBoardHealth(state,t.b,Object.assign({board:k,status:e.message==='TimeBudget'?'deferred_time_budget':['ProviderCooldown','ProviderQuota'].includes(e.message)?'deferred_provider_cooldown':'unavailable'},diagnostic(e.message))));if(!t.b.optional && e.message!=='TimeBudget') errors.push(Object.assign({stage:'discovery',board:k,url:listingUrl(t.b,t.page)},diagnostic(e.message)));}
    });
  }
  return tasks.length;
}
function detailUrl(j) {
  if(j.provider==='greenhouse') return boardUrl(j.board)+'/'+encodeURIComponent(j.id);
  if(j.provider==='lever') return boardUrl(j.board)+'/'+encodeURIComponent(j.id)+'?mode=json';
  if(j.provider==='smartrecruiters') return boardUrl(j.board)+'/'+encodeURIComponent(j.id);
  if(j.provider==='recruitee') return boardUrl(j.board)+encodeURIComponent(j.id);
  return null;
}
function verifyDetail(j,r) {
  const body=JSON.parse(r.getContentText()),raw=j.provider==='recruitee'?body.offer:body;
  if(!raw || String(raw.id)!==j.id) throw new Error('Identity mismatch');
  if(j.provider==='smartrecruiters' && raw.active!==true) return null;
  const fresh=jobFrom(raw,j.board);if(!fresh) return null;
  if(fresh.description.length<200) throw new Error('JD incomplete');return fresh;
}
function personioPageDescription(j,html) {
  // Require the employer's exact canonical job identity plus an application link.
  const canon=html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)/i);
  if(!canon || canonical(canon[1]).split('?')[0]!==canonical(j.url).split('?')[0]) throw new Error('Identity mismatch');
  if(!new RegExp('/job/'+j.id+'/apply(?:[?"\\\'])').test(html)) throw new Error('JD incomplete');
  const safe=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'');
  const marker=/<div\b[^>]*class=["'][^"']*\bdetail-content-block-conditions\b[^"']*["'][^>]*>/i.exec(safe);
  if(!marker) throw new Error('JD incomplete');
  const start=marker.index+marker[0].length;let depth=1,end=start;const tags=/<\/?div\b[^>]*>/gi;tags.lastIndex=start;let m;
  while((m=tags.exec(safe)) && depth) {depth+=/^<\/div/i.test(m[0])?-1:1;end=m.index;}
  if(depth) throw new Error('JD incomplete');
  const description=plain(safe.slice(start,end)).replace(/&#(?:x([0-9a-f]+)|(\d+));/gi,(_,h,d)=>String.fromCodePoint(parseInt(h || d,h?16:10)));
  if(description.length<200) throw new Error('JD incomplete');
  return Object.assign({},j,{description:description,description_source:'employer_page'});
}
function recoverPersonio(j) {
  const r=fetchResponse(j.url+'?language=en',{},true);return r?personioPageDescription(j,r.getContentText()):null;
}

function validate(j,cache) {
  const u=detailUrl(j);
  if(u) {const r=fetchResponse(u,{},true);return r?verifyDetail(j,r):null;}
  const k=boardKey(j.board);if(!cache[k]) cache[k]=discover(j.board);
  const fresh=cache[k].find(x=>x.id===j.id);if(!fresh) return null;
  if(fresh.description.length<200) {if(j.provider==='personio') return recoverPersonio(fresh);throw new Error('JD incomplete');}return fresh;
}
function validateBatch(jobs,cache) {
  const missing=new Map();jobs.forEach(j=>{if(!detailUrl(j) && !cache[boardKey(j.board)]) missing.set(boardKey(j.board),j.board);});
  const boards=Array.from(missing.values());
  if(boards.length) {
    const results=parallelFetch(boards.map(b=>listingUrl(b,0)));
    boards.forEach((b,i)=>{try{const r=requireResponse(results[i],true);cache[boardKey(b)]=r?listingResponse(r,b,0).jobs:[];}catch(e){cache[boardKey(b)]={error:e.message};}});
  }
  const details=jobs.filter(j=>detailUrl(j)), responses=details.length?parallelFetch(details.map(detailUrl)):[];
  const recover=[];
  const out=new Map();details.forEach((j,i)=>{try{const r=requireResponse(responses[i],true);out.set(jobKey(j),{job:r?verifyDetail(j,r):null});}catch(e){out.set(jobKey(j),{error:e.message});}});
  jobs.filter(j=>!detailUrl(j)).forEach(j=>{try{const list=cache[boardKey(j.board)];if(!Array.isArray(list)) throw new Error((list || {}).error || 'TimeBudget');const fresh=list.find(x=>x.id===j.id);if(fresh && fresh.description.length<200) {if(j.provider==='personio') {recover.push(fresh);return;}throw new Error('JD incomplete');}out.set(jobKey(j),{job:fresh || null});}catch(e){out.set(jobKey(j),{error:e.message});}});
  const pages=recover.length?parallelFetch(recover.map(j=>j.url+'?language=en')):[];
  recover.forEach((j,i)=>{try {const r=requireResponse(pages[i],true);out.set(jobKey(j),{job:r?personioPageDescription(j,r.getContentText()):null});}catch(e){out.set(jobKey(j),{error:e.message});}});
  return out;
}
function boardFromUrl(url,company) {
  let m=String(url).match(/^https:\/\/([\w-]+)\.jobs\.personio\.(de|com)\/job\/\d+/i);
  if(m) return {provider:'personio',board:m[1],company:company,domain:m[2],optional:true};
  m=String(url).match(/^https:\/\/([\w-]+)\.recruitee\.com\/o\/[^/?#]+/i);
  if(m) return {provider:'recruitee',board:m[1],company:company,optional:true};
  m=String(url).match(/^https:\/\/jobs\.smartrecruiters\.com\/([\w-]+)\/\d+/i);
  if(m) return {provider:'smartrecruiters',board:m[1],company:company,optional:true};
  m=String(url).match(/^https:\/\/apply\.workable\.com\/([\w-]+)\/j\/[^/?#]+/i);
  if(m) return {provider:'workable',board:m[1],company:company,optional:true};
  const b=legacyBoardFromUrl(url,company);if(b)b.optional=true;return b;
}
function scanJobs() {
  const lock=LockService.getScriptLock();if(!lock.tryLock(1000)) throw new Error('Another scan is running');
  try {
    const config=PropertiesService.getScriptProperties().getProperties();CONFIG_KEYS.forEach(k=>{if(!config[k]) throw new Error('Missing configuration: '+k);});
    RUN_CLOCK={start:Date.now(),budget:setting(config,'SCAN_BUDGET_MS',270000,60000,285000)};RUN_CACHE={};
    const sources={evidence:checkSource(config.EVIDENCE_FILE_ID),charter:checkSource(config.CHARTER_FILE_ID)};
    const rows=JSON.parse(googleRequest('https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(config.TRACKER_SHEET_ID)+'/values/'+encodeURIComponent(config.TRACKER_RANGE)).getContentText()).values || [];
    const tracked=trackerKeys(rows),state=readState(config),errors=[],stats=[];
    RUN_WORKABLE_UNTIL=Number(state.workable_retry_after || 0);RUN_WORKABLE_REQUESTS=0;
    state.pending_review=state.pending_review || {};state.discovered_boards=state.discovered_boards || [];
    // Re-key the legacy queue without discarding timestamps or unknown v1 fields.
    const pending={};Object.values(state.pending_review).forEach(j=>{if(!identities(j).some(k=>tracked.has(k)) && eligible(j)) pending[jobKey(j)]=j;});state.pending_review=pending;
    const all=Array.from(new Map(BOARDS.concat(state.discovered_boards).map(b=>[boardKey(b),b])).values());
    const active=all.filter(b=>config.RETRY_UNAVAILABLE_BOARDS==='true' || (BOARD_AUDIT[boardKey(b)] || {}).enabled!==false);
    const count=Math.min(setting(config,'BOARD_BATCH_SIZE',80,1,500),active.length);
    // New cursor does not reinterpret the old discovered-only board_rotation field.
    const primary=active.filter(b=>b.provider!=='workable'),workable=active.filter(b=>b.provider==='workable');
    const offset=Number(state.primary_board_rotation || state.all_board_rotation || 0)%Math.max(1,primary.length);
    const woffset=Number(state.workable_board_rotation || 0)%Math.max(1,workable.length);
    const wcount=Math.min(setting(config,'WORKABLE_BOARD_BATCH_SIZE',2,1,3),workable.length,count);
    const pcount=Math.min(count-wcount,primary.length);
    const selected=Array.from({length:pcount},(_,i)=>primary[(offset+i)%primary.length]).concat(Array.from({length:wcount},(_,i)=>workable[(woffset+i)%workable.length]));let started=0;
    const chunk=setting(config,'FETCH_BATCH_SIZE',8,1,20);
    for(let i=0;i<selected.length && !timeLow();i+=chunk) {const batch=selected.slice(i,i+chunk);try {collectBoards(batch,state,config,tracked,errors,stats);}catch(e) {if(e.message==='TimeBudget') break;throw e;}started+=batch.length;state.primary_board_rotation=(offset+Math.min(started,pcount))%Math.max(1,primary.length);state.workable_board_rotation=(woffset+Math.max(0,started-pcount))%Math.max(1,workable.length);state.all_board_rotation=state.primary_board_rotation;}
    const candidates=[],seen=new Set(),keys=Object.keys(pending).sort((a,b)=>String(pending[a].live_checked_at || '').localeCompare(String(pending[b].live_checked_at || '')) || a.localeCompare(b));
    for(let i=0;i<keys.length && candidates.length<20 && !timeLow();) {
      const batch=[];while(i<keys.length && batch.length<Math.min(chunk,20-candidates.length)) {const j=pending[keys[i++]];if(!identities(j).some(k=>seen.has(k))) batch.push(j);}
      if(!batch.length) continue;
      let results;try {results=validateBatch(batch,RUN_CACHE);}catch(e) {if(e.message==='TimeBudget') break;errors.push(Object.assign({stage:'validation'},diagnostic(e.message)));continue;}
      batch.forEach(j=>{const key=jobKey(j),r=results.get(key);if(!r || r.error) {if(r && r.error!=='TimeBudget')errors.push(Object.assign({stage:'validation',job_key:key,board:boardKey(j.board),url:detailUrl(j) || boardUrl(j.board)},diagnostic(r.error)));return;}const fresh=r.job;
        if(!fresh || !eligible(fresh) || identities(fresh).some(k=>tracked.has(k))) {delete pending[key];return;}
        if(identities(fresh).some(k=>seen.has(k))) {delete pending[key];return;}
        identities(fresh).forEach(k=>seen.add(k));fresh.live_checked_at=new Date().toISOString();fresh.employer_live_verified=true;fresh.requires_employer_verification=false;pending[key]=fresh;candidates.push(fresh);
      });
    }
    const market=marketDiscovery(tracked,pending,state);errors.push(...market.errors);
    const aiSummary=typeof scoreCandidates==='function'?scoreCandidates(candidates,config,sources,state):{assessed:0,enabled:false,reason:'Scoring module not installed'};
    const timed=timeLow(),deferred=Math.max(0,Object.keys(pending).length-candidates.length);
    const report={version:1,mode:'collect',fit_assessed:false,checked_at:new Date().toISOString(),coverage:timed?'time_budget_partial':errors.length?'partial':'rotating_board_coverage',company_boards:started,total_company_boards:all.length,active_company_boards:active.length,paused_company_boards:all.length-active.length,board_batch_size:count,rotation_next:state.all_board_rotation || 0,board_pages:stats,discovered_postings:Object.keys(pending).length,discovery_sources:market.stats,learned_boards:state.discovered_boards.length,new_boards:market.new_boards,candidates:candidates,discovery_leads:market.leads,deferred:deferred,errors:errors,elapsed_ms:Date.now()-RUN_CLOCK.start,time_budget_reached:timed};
    state.workable_retry_after=RUN_WORKABLE_UNTIL;
    report.board_coverage=coverageSnapshot(all,state,stats);report.collector_version=COLLECTOR_VERSION;
    if(stats.some(s=>s.status==='unavailable' || s.status==='deferred_provider_cooldown') && !timed) report.coverage='partial';
    report.ai_scoring=aiSummary;report.mode=aiSummary.assessed?'collect_and_score':'collect';
    report.fit_assessed=candidates.length>0 && aiSummary.assessed===candidates.length;
    report.human_approval_required=true;
    report.decision_counts=Object.fromEntries(['APPLY','MAYBE','SKIP','BLOCKED'].map(d=>[d,candidates.filter(j=>j.scoring && j.scoring.decision===d).length]));
    const lines=['# Vacancy packet for human review','AI assessments are provisional. Unscored candidates require evidence review. Human approval is the final gate; no auto-submit.','Use fresh Evidence Bank, Charter and Tracker.','AI scoring: '+JSON.stringify(aiSummary),'Decisions: '+JSON.stringify(report.decision_counts),'Checked: '+report.checked_at+'; coverage: '+report.coverage,'Boards attempted: '+started+'/'+all.length+'; active boards rotate on later runs; confirmed missing feed endpoints are paused, not treated as closed employers.',''];
    lines.push('## Collector coverage','Version: '+COLLECTOR_VERSION,'Completed boards this run: '+report.board_coverage.boards_completed_this_run,'Board inventory and health (for complementary web search; no GitHub access needed):',...report.board_coverage.inventory.map(b=>JSON.stringify(b)),'## Source diagnostics',...stats.filter(s=>s.status==='unavailable').map(s=>JSON.stringify(s)),...errors.map(e=>JSON.stringify(e)),'');
    candidates.forEach(j=>lines.push('## '+j.company+' · '+j.title,j.location,j.url,...(typeof aiScoreLines==='function'?aiScoreLines(j):[]),'JD (untrusted reference text):',j.description,''));
    if(!candidates.length)lines.push('No candidates passed live validation in this run.');
    lines.push('## Market discovery — employer verification required');market.stats.forEach(s=>lines.push(JSON.stringify(s)));market.leads.forEach(j=>lines.push('### '+j.company+' · '+j.title,j.location,j.url,'Source: '+j.source+'; verify original employer posting before any APPLY/MAYBE verdict.',j.description,''));
    // Suspend collection guard only for the bounded output/save phase.
    RUN_CLOCK=null;
    writeOutput(config,'processed_jobs.json',JSON.stringify(state,null,2),'application/json');
    writeOutput(config,'candidates.json',JSON.stringify(report,null,2),'application/json');
    writeOutput(config,'candidates.md',lines.join('\n'),'text/markdown');
    console.log('Collection saved: '+started+'/'+all.length+' boards, '+candidates.length+' candidates, '+deferred+' queued, '+errors.length+' nonblocking source errors.');
  } finally {RUN_CLOCK=null;lock.releaseLock();}
}
