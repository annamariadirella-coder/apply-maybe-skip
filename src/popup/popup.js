import { candidateProfile } from "../profile/candidate-profile.js";
import { screenJob } from "../screening/screen-job.js";
import {
  ANALYSIS_ERRORS,
  GET_JOB_PAGE_TEXT,
  buildJobPage,
  describeChromeMessageError,
  hasUsableJobText,
  isRestrictedTabUrl,
} from "./analyze-job.js";

const VERDICT_ICONS = Object.freeze({
  Apply: "🟢",
  Maybe: "🟡",
  Skip: "🔴",
});

export class AnalysisError extends Error {
  constructor(message) {
    super(message);
    this.name = "AnalysisError";
  }
}

function queryActiveTab(chromeApi) {
  return new Promise((resolve, reject) => {
    try {
      chromeApi.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const runtimeError = chromeApi.runtime?.lastError;

        if (runtimeError) {
          reject(new Error(runtimeError.message));
          return;
        }

        resolve(tabs?.[0]);
      });
    } catch (error) {
      reject(error);
    }
  });
}

function requestJobPageText(chromeApi, tabId) {
  return new Promise((resolve, reject) => {
    try {
      chromeApi.tabs.sendMessage(
        tabId,
        { type: GET_JOB_PAGE_TEXT },
        (response) => {
          const runtimeError = chromeApi.runtime?.lastError;

          if (runtimeError) {
            reject(new Error(runtimeError.message));
            return;
          }

          resolve(response);
        },
      );
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Run the browser boundary and the pure screening engine as one operation.
 * chromeApi is injectable so the complete popup flow can be tested in Node.
 */
export async function analyzeActiveTab(chromeApi) {
  const tab = await queryActiveTab(chromeApi);

  if (!tab || tab.id === undefined) {
    throw new AnalysisError(ANALYSIS_ERRORS.NO_TAB);
  }

  if (isRestrictedTabUrl(tab.url)) {
    throw new AnalysisError(ANALYSIS_ERRORS.RESTRICTED_PAGE);
  }

  let extracted;

  try {
    extracted = await requestJobPageText(chromeApi, tab.id);
  } catch (error) {
    throw new AnalysisError(describeChromeMessageError(error));
  }

  const jobPage = buildJobPage(extracted);

  if (!hasUsableJobText(jobPage)) {
    throw new AnalysisError(ANALYSIS_ERRORS.EMPTY_TEXT);
  }

  return {
    jobPage,
    result: screenJob(jobPage, candidateProfile),
  };
}

export function getAnalysisErrorMessage(error) {
  return error instanceof AnalysisError
    ? error.message
    : ANALYSIS_ERRORS.UNKNOWN;
}

export function selectPopupDetails(result) {
  return {
    blockers: result.blockers.map((item) => item.reason),
    matches: result.strongestMatches.slice(0, 3),
    gaps: result.keyGaps.slice(0, 3),
  };
}

function collectUi(root) {
  return {
    analyzeButton: root.querySelector("#analyze-button"),
    statusCard: root.querySelector("#status-card"),
    statusHeading: root.querySelector("#status-heading"),
    statusMessage: root.querySelector("#status-message"),
    resultPanel: root.querySelector("#result-panel"),
    verdict: root.querySelector("#verdict"),
    score: root.querySelector("#score"),
    jobTitle: root.querySelector("#job-title"),
    matchesSection: root.querySelector("#matches-section"),
    matches: root.querySelector("#matches-list"),
    gapsSection: root.querySelector("#gaps-section"),
    gaps: root.querySelector("#gaps-list"),
    blockersSection: root.querySelector("#blockers-section"),
    blockers: root.querySelector("#blockers-list"),
  };
}

function replaceList(section, list, items) {
  list.replaceChildren();
  section.hidden = items.length === 0;

  items.forEach((value) => {
    const item = document.createElement("li");
    item.textContent = value;
    list.append(item);
  });
}

function renderLoading(ui) {
  ui.analyzeButton.disabled = true;
  ui.analyzeButton.textContent = "Analyzing…";
  ui.statusCard.hidden = false;
  ui.statusCard.className = "status-card status-card--loading";
  ui.statusHeading.textContent = "Analyzing this tab";
  ui.statusMessage.textContent =
    "Reading the visible page text and checking it against your profile.";
  ui.resultPanel.hidden = true;
}

function renderError(ui, message) {
  ui.analyzeButton.disabled = false;
  ui.analyzeButton.textContent = "Try again";
  ui.statusCard.hidden = false;
  ui.statusCard.className = "status-card status-card--error";
  ui.statusHeading.textContent = "Unable to analyze";
  ui.statusMessage.textContent = message;
  ui.resultPanel.hidden = true;
}

function renderResult(ui, jobPage, result) {
  const verdictClass = result.verdict.toLowerCase();
  const details = selectPopupDetails(result);

  ui.analyzeButton.disabled = false;
  ui.analyzeButton.textContent = "Analyze again";
  ui.statusCard.hidden = true;
  ui.resultPanel.hidden = false;
  ui.resultPanel.className = `result-card result-card--${verdictClass}`;
  ui.verdict.textContent = `${VERDICT_ICONS[result.verdict]} ${result.verdict}`;
  ui.score.textContent = `${result.score} / 100`;
  ui.jobTitle.textContent = jobPage.title || "Untitled job page";
  replaceList(ui.blockersSection, ui.blockers, details.blockers);
  replaceList(ui.matchesSection, ui.matches, details.matches);
  replaceList(ui.gapsSection, ui.gaps, details.gaps);
  ui.resultPanel.focus();
}

function startPopup(root, chromeApi) {
  const ui = collectUi(root);

  const run = async () => {
    renderLoading(ui);

    try {
      const { jobPage, result } = await analyzeActiveTab(chromeApi);
      renderResult(ui, jobPage, result);
    } catch (error) {
      renderError(ui, getAnalysisErrorMessage(error));
    }
  };

  ui.analyzeButton.addEventListener("click", run);
  void run();
}

if (typeof document !== "undefined" && typeof chrome !== "undefined") {
  startPopup(document, chrome);
}
