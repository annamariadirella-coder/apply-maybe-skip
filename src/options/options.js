import { PROFILE_STORAGE_KEY } from "../profile/profile-settings.js";
import {
  PROFESSIONAL_MEMORY_KEY,
  emptyProfessionalMemory,
  mergeCvSource,
  reviewEvidence,
} from "../profile/professional-memory.js";

const PROFILE_FIELDS = [
  "targetRoles",
  "potentialRoles",
  "skipRoles",
  "preferredSeniority",
  "potentialSeniority",
  "skipSeniority",
  "preferredLocations",
  "verifiedLanguages",
  "unavailableLanguages",
  "strengths",
];

export function parseList(value = "") {
  return [
    ...new Set(
      String(value)
        .split(/[\n,;]+/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}

function formatList(values = []) {
  return values.join("\n");
}

function readStoredProfile(chromeApi) {
  return new Promise((resolve, reject) => {
    chromeApi.storage.local.get([PROFILE_STORAGE_KEY], (stored) => {
      const runtimeError = chromeApi.runtime?.lastError;

      if (runtimeError) {
        reject(new Error(runtimeError.message));
        return;
      }

      resolve(stored?.[PROFILE_STORAGE_KEY]);
    });
  });
}

function saveStoredProfile(chromeApi, settings) {
  return new Promise((resolve, reject) => {
    chromeApi.storage.local.set({ [PROFILE_STORAGE_KEY]: settings }, () => {
      const runtimeError = chromeApi.runtime?.lastError;

      if (runtimeError) {
        reject(new Error(runtimeError.message));
        return;
      }

      resolve();
    });
  });
}

function clearStoredProfile(chromeApi) {
  return new Promise((resolve, reject) => {
    chromeApi.storage.local.remove(PROFILE_STORAGE_KEY, () => {
      const runtimeError = chromeApi.runtime?.lastError;

      if (runtimeError) {
        reject(new Error(runtimeError.message));
        return;
      }

      resolve();
    });
  });
}

function readMemory(chromeApi) {
  return new Promise((resolve, reject) => {
    chromeApi.storage.local.get([PROFESSIONAL_MEMORY_KEY], (stored) => {
      const runtimeError = chromeApi.runtime?.lastError;
      if (runtimeError) return reject(new Error(runtimeError.message));
      resolve(stored?.[PROFESSIONAL_MEMORY_KEY] ?? emptyProfessionalMemory());
    });
  });
}

function saveMemory(chromeApi, memory) {
  return new Promise((resolve, reject) => {
    chromeApi.storage.local.set({ [PROFESSIONAL_MEMORY_KEY]: memory }, () => {
      const runtimeError = chromeApi.runtime?.lastError;
      if (runtimeError) return reject(new Error(runtimeError.message));
      resolve();
    });
  });
}

function clearMemory(chromeApi) {
  return new Promise((resolve, reject) => {
    chromeApi.storage.local.remove(PROFESSIONAL_MEMORY_KEY, () => {
      const runtimeError = chromeApi.runtime?.lastError;
      if (runtimeError) return reject(new Error(runtimeError.message));
      resolve();
    });
  });
}

function selectedEvidence(root) {
  return [...root.querySelectorAll("input[type='checkbox']:checked")].map(
    (input) => input.value,
  );
}

function renderMemory(root, memory) {
  const summary = root.querySelector("#memory-summary");
  const sourceList = root.querySelector("#source-list");
  const review = root.querySelector("#evidence-review");
  const evidenceList = root.querySelector("#evidence-list");
  const pending = memory.evidence.filter((item) => item.status === "pending");

  summary.hidden = memory.sources.length === 0;
  sourceList.replaceChildren();
  memory.sources.forEach((source) => {
    const item = document.createElement("li");
    item.textContent = source.name;
    sourceList.append(item);
  });
  review.hidden = pending.length === 0;
  evidenceList.replaceChildren();
  pending.forEach((evidence) => {
    const label = document.createElement("label");
    label.className = "evidence-item";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = evidence.key;
    const text = document.createElement("span");
    text.textContent = `${evidence.label} · found in ${evidence.sourceIds.length} CV${evidence.sourceIds.length === 1 ? "" : "s"}`;
    label.append(checkbox, text);
    evidenceList.append(label);
  });
}

function collectSettings(form) {
  return {
    configured: true,
    ...Object.fromEntries(
      PROFILE_FIELDS.map((field) => [field, parseList(form.elements[field].value)]),
    ),
  };
}

function populateForm(form, settings) {
  PROFILE_FIELDS.forEach((field) => {
    form.elements[field].value = formatList(settings?.[field]);
  });
}

function showStatus(element, message, isError = false) {
  element.textContent = message;
  element.classList.toggle("form-status--error", isError);
}

async function startOptions(root, chromeApi) {
  const form = root.querySelector("#profile-form");
  const resetButton = root.querySelector("#reset-button");
  const status = root.querySelector("#form-status");
  const memoryStatus = root.querySelector("#memory-status");
  const files = root.querySelector("#cv-files");
  let memory = emptyProfessionalMemory();

  try {
    populateForm(form, await readStoredProfile(chromeApi));
    memory = await readMemory(chromeApi);
    renderMemory(root, memory);
  } catch {
    showStatus(status, "Your saved profile could not be loaded.", true);
  }

  root.querySelector("#import-cvs-button").addEventListener("click", async () => {
    const selectedFiles = [...files.files];
    if (selectedFiles.length === 0) {
      showStatus(memoryStatus, "Select at least one PDF first.", true);
      return;
    }
    showStatus(memoryStatus, `Reading ${selectedFiles.length} CV${selectedFiles.length === 1 ? "" : "s"} locally...`);
    let imported = 0;
    let duplicates = 0;
    let workingMemory = memory;
    try {
      const { importPdf } = await import("../profile/pdf-profile-import.js");
      for (const file of selectedFiles) {
        const parsed = await importPdf(file);
        const merged = mergeCvSource(
          workingMemory,
          parsed.source,
          parsed.candidates,
        );
        workingMemory = merged.memory;
        if (merged.duplicate) duplicates += 1;
        else imported += 1;
      }
      memory = workingMemory;
      await saveMemory(chromeApi, memory);
      renderMemory(root, memory);
      showStatus(memoryStatus, `${imported} new CV${imported === 1 ? "" : "s"} imported${duplicates ? `, ${duplicates} existing source${duplicates === 1 ? "" : "s"} rechecked` : ""}. Review the evidence below.`);
    } catch {
      showStatus(memoryStatus, "One of the PDFs could not be read. No file was uploaded.", true);
    }
  });

  const applyReview = async (reviewStatus) => {
    const keys = selectedEvidence(root.querySelector("#evidence-list"));
    if (keys.length === 0) {
      showStatus(memoryStatus, "Select at least one evidence item.", true);
      return;
    }
    try {
      const reviewedMemory = reviewEvidence(memory, keys, reviewStatus);
      await saveMemory(chromeApi, reviewedMemory);
      memory = reviewedMemory;
      renderMemory(root, memory);
      showStatus(
        memoryStatus,
        reviewStatus === "approved"
          ? "Evidence approved and added to your professional memory."
          : "Evidence rejected.",
      );
    } catch {
      showStatus(memoryStatus, "The evidence review could not be saved.", true);
    }
  };
  root.querySelector("#approve-evidence-button").addEventListener("click", () => void applyReview("approved"));
  root.querySelector("#reject-evidence-button").addEventListener("click", () => void applyReview("rejected"));
  root.querySelector("#clear-memory-button").addEventListener("click", async () => {
    try {
      await clearMemory(chromeApi);
      memory = emptyProfessionalMemory();
      files.value = "";
      renderMemory(root, memory);
      showStatus(memoryStatus, "CV memory cleared from this browser.");
    } catch {
      showStatus(memoryStatus, "CV memory could not be cleared.", true);
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const settings = collectSettings(form);

    if (
      settings.targetRoles.length === 0 ||
      settings.verifiedLanguages.length === 0 ||
      (settings.strengths.length === 0 &&
        memory.evidence.every((item) => item.status !== "approved"))
    ) {
      showStatus(status, "Add at least one target role, language, and strength.", true);
      return;
    }

    try {
      await saveStoredProfile(chromeApi, settings);
      showStatus(status, "Profile saved. Job checks will now use your information.");
    } catch {
      showStatus(status, "Your profile could not be saved. Please try again.", true);
    }
  });

  resetButton.addEventListener("click", async () => {
    try {
      await clearStoredProfile(chromeApi);
      form.reset();
      showStatus(status, "Custom profile removed. The repository example is active.");
    } catch {
      showStatus(status, "The custom profile could not be removed.", true);
    }
  });
}

if (
  typeof document !== "undefined" &&
  typeof chrome !== "undefined" &&
  chrome.storage?.local
) {
  void startOptions(document, chrome);
}
