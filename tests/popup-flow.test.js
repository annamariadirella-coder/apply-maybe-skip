import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ANALYSIS_ERRORS,
  GET_JOB_PAGE_TEXT,
  buildJobPage,
  describeChromeMessageError,
  hasUsableJobText,
  isRestrictedTabUrl,
} from "../src/popup/analyze-job.js";
import { analyzeActiveTab } from "../src/popup/popup.js";

function fakeChrome({
  tabs = [{ id: 7, url: "https://example.com/jobs/123" }],
  response,
  messageError,
} = {}) {
  const calls = [];
  const chromeApi = {
    runtime: { lastError: null },
    tabs: {
      query(query, callback) {
        calls.push({ operation: "query", query });
        callback(tabs);
      },
      sendMessage(tabId, message, callback) {
        calls.push({ operation: "sendMessage", tabId, message });

        if (messageError) {
          chromeApi.runtime.lastError = { message: messageError };
        }

        callback(response);
        chromeApi.runtime.lastError = null;
      },
    },
  };

  return { chromeApi, calls };
}

test("analysis helpers normalize extracted page data", () => {
  const jobPage = buildJobPage({
    title: "  Senior Product Operations  ",
    location: null,
    text: "  Berlin. English is required.  ",
    url: " https://example.com/job ",
  });

  assert.deepEqual(jobPage, {
    title: "Senior Product Operations",
    location: "",
    text: "Berlin. English is required.",
    url: "https://example.com/job",
  });
  assert.equal(hasUsableJobText(jobPage), true);
  assert.equal(hasUsableJobText({ text: "" }), false);
  assert.equal(isRestrictedTabUrl("chrome://extensions"), true);
  assert.equal(isRestrictedTabUrl("https://example.com"), false);
});

test("popup flow requests the active tab, builds jobPage, and screens it", async () => {
  const { chromeApi, calls } = fakeChrome({
    response: {
      title: "Senior Product Operations",
      url: "https://example.com/jobs/123",
      text: [
        "Berlin.",
        "English is required.",
        "Product operations and process improvement.",
        "Stakeholder management and cross functional collaboration.",
        "Program management and data driven decision making.",
      ].join(" "),
    },
  });

  const { jobPage, result } = await analyzeActiveTab(chromeApi);

  assert.equal(jobPage.url, "https://example.com/jobs/123");
  assert.equal(result.verdict, "Apply");
  assert.equal(result.score, 100);
  assert.deepEqual(calls, [
    {
      operation: "query",
      query: { active: true, currentWindow: true },
    },
    {
      operation: "sendMessage",
      tabId: 7,
      message: { type: GET_JOB_PAGE_TEXT },
    },
  ]);
});

test("popup flow rejects restricted tabs before messaging a content script", async () => {
  const { chromeApi, calls } = fakeChrome({
    tabs: [{ id: 9, url: "chrome://extensions" }],
  });

  await assert.rejects(
    analyzeActiveTab(chromeApi),
    (error) => error.message === ANALYSIS_ERRORS.RESTRICTED_PAGE,
  );
  assert.equal(calls.length, 1);
});

test("popup flow reports empty extracted text", async () => {
  const { chromeApi } = fakeChrome({
    response: { title: "Example", url: "https://example.com", text: "  " },
  });

  await assert.rejects(
    analyzeActiveTab(chromeApi),
    (error) => error.message === ANALYSIS_ERRORS.EMPTY_TEXT,
  );
});

test("missing content script errors get a useful retry message", async () => {
  const rawError = "Could not establish connection. Receiving end does not exist.";
  const { chromeApi } = fakeChrome({ messageError: rawError });

  assert.equal(
    describeChromeMessageError(new Error(rawError)),
    ANALYSIS_ERRORS.NO_CONTENT_SCRIPT,
  );
  await assert.rejects(
    analyzeActiveTab(chromeApi),
    (error) => error.message === ANALYSIS_ERRORS.NO_CONTENT_SCRIPT,
  );
});
