/**
 * Popup-side helpers for turning a tab + extracted page into a jobPage
 * object and classifying integration errors. Pure functions; no Chrome APIs.
 */

export const GET_JOB_PAGE_TEXT = "GET_JOB_PAGE_TEXT";

export const ANALYSIS_ERRORS = Object.freeze({
  RESTRICTED_PAGE:
    "This page can't be analyzed. Chrome pages, the Web Store, and similar restricted tabs are not supported.",
  NO_TAB: "No active tab was found.",
  NO_CONTENT_SCRIPT:
    "Couldn't read this tab. Reload the page and try again.",
  EMPTY_TEXT:
    "No usable job text was found on this page. Open a job posting and try again.",
  INCOMPLETE_JOB:
    "The full job description has not loaded yet. Open or scroll to the description, then try again.",
  UNKNOWN: "Something went wrong while analyzing this page.",
});

export function isRestrictedTabUrl(url = "") {
  return !/^https?:\/\//i.test(String(url));
}

export function buildJobPage(extracted = {}) {
  return {
    title: String(extracted.title ?? "").trim(),
    location: String(extracted.location ?? "").trim(),
    text: String(extracted.text ?? "").trim(),
    url: String(extracted.url ?? "").trim(),
    ...(typeof extracted.descriptionFound === "boolean"
      ? { descriptionFound: extracted.descriptionFound }
      : {}),
  };
}

export function hasUsableJobText(jobPage = {}) {
  return Boolean(jobPage.text);
}

export function hasCompleteJobDescription(jobPage = {}) {
  if (jobPage.descriptionFound !== false) {
    return true;
  }

  return !/linkedin\.com\/jobs\//i.test(jobPage.url);
}

export function describeChromeMessageError(error) {
  const message = String(error?.message ?? error ?? "");

  if (
    message.includes("Receiving end does not exist") ||
    message.includes("Could not establish connection")
  ) {
    return ANALYSIS_ERRORS.NO_CONTENT_SCRIPT;
  }

  return ANALYSIS_ERRORS.UNKNOWN;
}
