import assert from "node:assert/strict";
import { test } from "node:test";
import { candidateProfile } from "../src/profile/candidate-profile.js";
import { screenJob } from "../src/screening/screen-job.js";

await import("../src/content/job-page-data.js");

const { extractJobPageData } = globalThis.ApplyMaybeSkipJobPageData;

function element(text, selectors = {}) {
  return {
    innerText: text,
    textContent: text,
    querySelector(selector) {
      return selectors[selector] ?? null;
    },
  };
}

function page({ title = "", body = "", selectors = {}, structuredData = [] }) {
  return {
    title,
    body: element(body),
    querySelector(selector) {
      return selectors[selector] ?? null;
    },
    querySelectorAll(selector) {
      if (selector !== 'script[type="application/ld+json"]') {
        return [];
      }

      return structuredData.map((value) => ({
        textContent: JSON.stringify(value),
      }));
    },
  };
}

test("LinkedIn extraction ignores surrounding search results", () => {
  const selectedJob = element(
    "Chief of Staff. Remote Germany. Process improvement. English required.",
    {
      h1: element("Chief of Staff"),
      ".jobs-unified-top-card__primary-description-container":
        element("Stableton · Remote Germany"),
    },
  );
  const document = page({
    title: "Chief of Staff | LinkedIn",
    body: "Other result: German is mandatory in Berlin. Selected job follows.",
    selectors: {
      ".jobs-search__job-details--container": selectedJob,
    },
  });

  const extracted = extractJobPageData(
    document,
    "https://www.linkedin.com/jobs/view/123",
  );

  assert.equal(extracted.title, "Chief of Staff");
  assert.equal(extracted.location, "Stableton · Remote Germany");
  assert.match(extracted.text, /Process improvement/);
  assert.doesNotMatch(extracted.text, /German is mandatory/);
});

test("company careers extraction prefers JobPosting structured data", () => {
  const document = page({
    title: "Careers",
    body: "Navigation and unrelated vacancies",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        title: "Chief of Staff",
        description:
          "<p>Process improvement and cross-functional collaboration.</p><p>English required.</p>",
        jobLocationType: "TELECOMMUTE",
        applicantLocationRequirements: {
          "@type": "Country",
          name: "Germany",
        },
        url: "https://company.example/jobs/chief-of-staff",
      },
    ],
  });

  const extracted = extractJobPageData(document, "https://company.example/jobs");

  assert.equal(extracted.title, "Chief of Staff");
  assert.equal(extracted.location, "Remote · Germany");
  assert.equal(
    extracted.text,
    "Process improvement and cross-functional collaboration. English required.",
  );
  assert.equal(extracted.url, "https://company.example/jobs/chief-of-staff");
});

test("equivalent job-board facts produce the same score", () => {
  const description =
    "Process improvement and cross-functional collaboration. English required.";
  const linkedInPage = page({
    title: "LinkedIn",
    selectors: {
      ".jobs-search__job-details--container": element(
        `Chief of Staff. Remote Germany. ${description}`,
        {
          h1: element("Chief of Staff"),
          ".jobs-unified-top-card__primary-description-container":
            element("Remote Germany"),
        },
      ),
    },
  });
  const companyPage = page({
    structuredData: [
      {
        "@type": "JobPosting",
        title: "Chief of Staff",
        description,
        jobLocationType: "TELECOMMUTE",
        applicantLocationRequirements: { name: "Germany" },
      },
    ],
  });
  const linkedInResult = screenJob(
    extractJobPageData(linkedInPage, "https://linkedin.example/job"),
    candidateProfile,
  );
  const companyResult = screenJob(
    extractJobPageData(companyPage, "https://company.example/job"),
    candidateProfile,
  );

  assert.equal(linkedInResult.score, companyResult.score);
  assert.equal(linkedInResult.verdict, companyResult.verdict);
});
