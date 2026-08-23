/**
 * Verified screening preferences and match signals.
 *
 * This configuration describes what to look for; it does not claim that the
 * candidate held any particular title or has an unprovided proficiency level.
 */

function deepFreeze(value) {
  Object.values(value).forEach((item) => {
    if (item && typeof item === "object" && !Object.isFrozen(item)) {
      deepFreeze(item);
    }
  });

  return Object.freeze(value);
}

export const candidateProfile = deepFreeze({
  roleFit: {
    strong: [
      {
        label: "Product Operations",
        titlePatterns: ["product operations"],
      },
      {
        label: "Product Strategy & Operations",
        titlePatterns: ["product strategy and operations"],
      },
      {
        label: "Strategy & Operations",
        titlePatterns: ["strategy and operations", "strategy operations"],
      },
      {
        label: "Business Operations",
        titlePatterns: ["business operations"],
      },
      {
        label: "Founder's Office",
        titlePatterns: ["founders office", "founder office"],
      },
      {
        label: "COO Office / Chief of Staff operations",
        titlePatterns: [
          "coo office",
          "office of the coo",
          "chief of staff",
        ],
      },
      {
        label: "Program Management",
        titlePatterns: ["program manager", "programme manager", "program management"],
      },
      {
        label: "Cross-functional Operations",
        titlePatterns: ["cross functional operations"],
      },
    ],
    potential: [
      {
        label: "Product Management with operational scope",
        titlePatterns: ["product manager", "product management"],
        contextPatterns: [
          "operations",
          "product discovery",
          "customer discovery",
          "process improvement",
          "workflow",
          "cross functional",
        ],
      },
      {
        label: "Customer Operations / Service Delivery leadership",
        titlePatterns: ["customer operations", "service delivery"],
        contextPatterns: ["lead", "head", "manager", "director", "leadership"],
      },
      {
        label: "Operational transformation",
        titlePatterns: [
          "operational transformation",
          "operations transformation",
          "business transformation",
        ],
      },
    ],
    usuallySkip: [
      {
        label: "Pure Software Engineering",
        titlePatterns: [
          "software engineer",
          "software developer",
          "frontend engineer",
          "front end engineer",
          "backend engineer",
          "back end engineer",
          "full stack engineer",
          "fullstack engineer",
        ],
      },
      {
        label: "Data Engineering",
        titlePatterns: ["data engineer", "analytics engineer"],
      },
      {
        label: "DevOps",
        titlePatterns: [
          "devops",
          "site reliability engineer",
          "platform engineer",
        ],
      },
      {
        label: "Pure Sales",
        titlePatterns: [
          "account executive",
          "sales executive",
          "sales representative",
          "sales development representative",
          "business development representative",
          "sales manager",
        ],
      },
      {
        label: "Pure Marketing",
        titlePatterns: [
          "marketing manager",
          "marketing specialist",
          "content marketer",
          "growth marketer",
          "brand manager",
        ],
      },
    ],
    deepCodingRequirementPatterns: [
      "hands on coding",
      "code every day",
      "daily coding",
      "production grade code",
      "advanced software development",
      "deep coding expertise",
    ],
  },
  seniority: {
    preferred: ["senior", "lead", "head"],
    potential: ["manager", "director"],
    usuallySkip: ["intern", "internship", "junior", "entry level", "graduate"],
  },
  location: {
    preferred: [
      {
        label: "Berlin",
        patterns: ["berlin"],
      },
      {
        label: "Remote in Germany",
        patterns: [
          "remote germany",
          "germany remote",
          "remote within germany",
          "work remotely from germany",
        ],
      },
      {
        label: "Remote EMEA",
        patterns: ["remote emea", "emea remote"],
      },
      {
        label: "Remote Europe",
        patterns: [
          "remote europe",
          "europe remote",
          "remote within europe",
        ],
      },
    ],
    potential: [
      {
        label: "Hybrid in Germany",
        patterns: ["germany hybrid", "hybrid germany"],
      },
      {
        label: "Hybrid in Berlin",
        patterns: ["berlin hybrid", "hybrid berlin"],
      },
    ],
    relocationRequiredPatterns: [
      "mandatory relocation",
      "must relocate",
      "relocation is required",
      "relocation required",
      "required to relocate",
    ],
    onsiteRequiredPatterns: [
      "fully onsite",
      "fully on site",
      "onsite only",
      "on site only",
      "must work onsite",
      "must work on site",
      "five days onsite",
      "five days on site",
      "5 days onsite",
      "5 days on site",
    ],
  },
  languages: {
    verified: ["italian", "english"],
    unavailable: [
      {
        label: "German",
        requiredPatterns: [
          "german required",
          "german is required",
          "german language required",
          "must speak german",
          "german speaking",
          "native german",
          "native level german",
          "german native",
          "german native level",
          "fluent german",
          "business fluent german",
          "professional german",
          "advanced german",
          "excellent german",
          "very good german",
          "good command of german",
          "german language skills",
          "fluency in german",
          "c1 german",
          "german c1",
          "german at c1",
          "c2 german",
          "c2 level german",
          "german c2",
          "german at c2",
        ],
      },
    ],
    otherRecognizedLanguages: [
      "french",
      "spanish",
      "dutch",
      "portuguese",
      "polish",
      "danish",
      "swedish",
      "norwegian",
      "finnish",
      "czech",
    ],
  },
  strengthSignals: [
    {
      label: "Product operations",
      weight: 4,
      patterns: ["product operations", "product ops"],
    },
    {
      label: "Cross-functional operations",
      weight: 4,
      patterns: ["cross functional operations", "cross functional initiatives"],
    },
    {
      label: "Process improvement",
      weight: 3,
      patterns: ["process improvement", "continuous improvement"],
    },
    {
      label: "Workflow optimization",
      weight: 3,
      patterns: ["workflow optimization", "workflow improvement", "optimize workflows"],
    },
    {
      label: "Operational efficiency",
      weight: 3,
      patterns: ["operational efficiency", "operational excellence"],
    },
    {
      label: "Stakeholder management",
      weight: 3,
      patterns: ["stakeholder management", "manage stakeholders"],
    },
    {
      label: "Product, business, and engineering collaboration",
      weight: 4,
      patterns: [
        "product business and engineering",
        "product and engineering teams",
        "business and engineering teams",
        "cross functional collaboration",
      ],
    },
    {
      label: "Customer operations",
      weight: 3,
      patterns: ["customer operations", "customer ops"],
    },
    {
      label: "Service delivery",
      weight: 3,
      patterns: ["service delivery"],
    },
    {
      label: "Team leadership",
      weight: 3,
      patterns: ["team leadership", "lead a team", "people leadership"],
    },
    {
      label: "Program / project coordination",
      weight: 3,
      patterns: [
        "program coordination",
        "programme coordination",
        "project coordination",
        "program management",
        "project management",
      ],
    },
    {
      label: "AI-enabled workflow improvement",
      weight: 2,
      patterns: [
        "ai enabled workflow",
        "ai powered workflow",
        "artificial intelligence workflow",
        "workflow automation with ai",
      ],
    },
    {
      label: "AWS fundamentals",
      weight: 2,
      patterns: ["aws", "amazon web services"],
    },
    {
      label: "Databricks fundamentals",
      weight: 2,
      patterns: ["databricks"],
    },
    {
      label: "Data-informed decision making",
      weight: 3,
      patterns: [
        "data informed decision making",
        "data driven decision making",
        "use data to inform decisions",
      ],
    },
    {
      label: "Customer feedback and product discovery",
      weight: 3,
      patterns: [
        "customer feedback",
        "product discovery",
        "customer discovery",
        "user research",
      ],
    },
  ],
  scoring: {
    categoryMaximums: {
      roleFunction: 35,
      seniority: 15,
      location: 20,
      language: 10,
      relevantStrengths: 20,
    },
    thresholds: {
      apply: 75,
      maybe: 50,
    },
  },
});

