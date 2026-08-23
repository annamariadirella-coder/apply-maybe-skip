/**
 * Reads job-page content from the current tab.
 *
 * The first scaffold exposes a small message boundary for the popup.
 * Page-specific extraction and normalization belong in a later milestone.
 */

const GET_JOB_PAGE_TEXT = "GET_JOB_PAGE_TEXT";

function extractVisiblePageText() {
  return document.body?.innerText.trim() ?? "";
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== GET_JOB_PAGE_TEXT) {
    return false;
  }

  sendResponse({
    title: document.title,
    url: window.location.href,
    text: extractVisiblePageText(),
  });

  return false;
});
