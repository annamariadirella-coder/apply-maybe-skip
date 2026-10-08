/** Reads normalized job content from the current tab. */

const GET_JOB_PAGE_TEXT = "GET_JOB_PAGE_TEXT";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== GET_JOB_PAGE_TEXT) {
    return false;
  }

  sendResponse(
    globalThis.ApplyMaybeSkipJobPageData.extractJobPageData(
      document,
      window.location.href,
    ),
  );

  return false;
});
