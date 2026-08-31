import { PROFILE_STORAGE_KEY } from "../profile/profile-settings.js";
import {
  filesNeedingSync,
  folderPermission,
  forgetCvFolderHandle,
  listPdfFiles,
  loadCvFolderHandle,
  saveCvFolderHandle,
} from "../profile/cv-folder.js";
import {
  PROFESSIONAL_MEMORY_KEY,
  emptyProfessionalMemory,
  mergeCvSource,
  suggestedRoleLabels,
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

function renderMemory(root, memory, form, autofillRoles = false) {
  const summary = root.querySelector("#memory-summary");
  const memoryCount = root.querySelector("#memory-count");
  const roleSummary = root.querySelector("#role-suggestions");
  const roleList = root.querySelector("#role-suggestion-list");
  const signalSummary = root.querySelector("#signal-summary");
  const signalList = root.querySelector("#signal-list");
  const roles = suggestedRoleLabels(memory);
  const signals = [...(memory.evidence ?? [])]
    .filter((item) => item.status !== "rejected")
    .sort(
      (left, right) =>
        (right.sourceIds?.length ?? 0) - (left.sourceIds?.length ?? 0) ||
        left.label.localeCompare(right.label),
    );

  summary.hidden = memory.sources.length === 0;
  memoryCount.textContent = `${memory.sources.length} CV${memory.sources.length === 1 ? "" : "s"} in your professional memory. Duplicate files are counted once.`;
  roleSummary.hidden = roles.length === 0;
  roleList.textContent = roles.join(" · ");
  signalSummary.hidden = signals.length === 0;
  signalList.textContent = [
    ...signals.slice(0, 12).map((item) => item.label),
    ...(signals.length > 12 ? [`+ ${signals.length - 12} more`] : []),
  ].join(" · ");

  if (autofillRoles && roles.length > 0 && !form.elements.targetRoles.value.trim()) {
    form.elements.targetRoles.value = formatList(roles);
  }
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
  const profileMode = root.querySelector("#profile-mode");
  const memoryStatus = root.querySelector("#memory-status");
  const folderStatus = root.querySelector("#folder-status");
  const chooseFolderButton = root.querySelector("#choose-folder-button");
  const syncFolderButton = root.querySelector("#sync-folder-button");
  const disconnectFolderButton = root.querySelector("#disconnect-folder-button");
  const files = root.querySelector("#cv-files");
  let memory = emptyProfessionalMemory();
  let cvFolder;

  const renderFolder = () => {
    const connected = Boolean(cvFolder);
    syncFolderButton.hidden = !connected;
    disconnectFolderButton.hidden = !connected;
    chooseFolderButton.textContent = connected ? "Change CV folder" : "Choose CV folder";
    folderStatus.textContent = connected
      ? `Connected to “${cvFolder.name}”. New or modified PDFs sync automatically when this page opens.`
      : "Choose the folder where you save your CVs. New or modified PDFs will be detected when this page opens.";
  };

  const importEntries = async (entries) => {
    let imported = 0;
    let duplicates = 0;
    let workingMemory = memory;
    const { importPdf } = await import("../profile/pdf-profile-import.js");

    for (const entry of entries) {
      const parsed = await importPdf(entry.file, entry.relativePath);
      const merged = mergeCvSource(
        workingMemory,
        parsed.source,
        parsed.candidates,
        parsed.roles,
      );
      workingMemory = merged.memory;
      if (merged.duplicate) duplicates += 1;
      else imported += 1;
    }

    memory = workingMemory;
    await saveMemory(chromeApi, memory);
    renderMemory(root, memory, form, true);
    return { imported, duplicates };
  };

  const syncConnectedFolder = async (requestPermission = false) => {
    if (!cvFolder) return;

    chooseFolderButton.disabled = true;
    syncFolderButton.disabled = true;
    showStatus(memoryStatus, `Checking “${cvFolder.name}” for new or modified CVs...`);

    try {
      const permission = await folderPermission(cvFolder, requestPermission);

      if (permission !== "granted") {
        showStatus(
          memoryStatus,
          "Folder access needs your permission. Select Sync now to reconnect it.",
          true,
        );
        return;
      }

      const folderFiles = await listPdfFiles(cvFolder);
      const changedFiles = filesNeedingSync(folderFiles, memory);

      if (changedFiles.length === 0) {
        showStatus(
          memoryStatus,
          `Folder is up to date. ${folderFiles.length} PDF${folderFiles.length === 1 ? "" : "s"} checked.`,
        );
        return;
      }

      showStatus(
        memoryStatus,
        `Reading ${changedFiles.length} new or modified CV${changedFiles.length === 1 ? "" : "s"} locally...`,
      );
      await importEntries(changedFiles);
      showStatus(
        memoryStatus,
        `Folder synced. ${changedFiles.length} PDF file${changedFiles.length === 1 ? "" : "s"} processed; ${memory.sources.length} unique CV${memory.sources.length === 1 ? "" : "s"} in your professional memory.`,
      );
    } catch (error) {
      const cancelled = error?.name === "AbortError";
      showStatus(
        memoryStatus,
        cancelled
          ? "Folder selection was cancelled."
          : "The connected folder could not be synced. Try reconnecting it.",
        !cancelled,
      );
    } finally {
      chooseFolderButton.disabled = false;
      syncFolderButton.disabled = false;
    }
  };

  try {
    const storedProfile = await readStoredProfile(chromeApi);
    populateForm(form, storedProfile);
    profileMode.textContent = storedProfile?.configured
      ? "Your saved profile is active."
      : "No personal profile is saved. The light text in the fields is example text, and screening currently uses the repository demo profile.";
    memory = await readMemory(chromeApi);
    renderMemory(root, memory, form, true);
    cvFolder = await loadCvFolderHandle();
    renderFolder();

    if (cvFolder && (await folderPermission(cvFolder)) === "granted") {
      await syncConnectedFolder();
    }
  } catch {
    showStatus(status, "Your saved profile could not be loaded.", true);
  }

  chooseFolderButton.addEventListener("click", async () => {
    if (typeof globalThis.showDirectoryPicker !== "function") {
      showStatus(
        memoryStatus,
        "Folder sync is not available in this Chrome version. Use individual PDF import instead.",
        true,
      );
      return;
    }

    try {
      const selectedFolder = await globalThis.showDirectoryPicker({ mode: "read" });
      await saveCvFolderHandle(selectedFolder);
      cvFolder = selectedFolder;
      renderFolder();
      await syncConnectedFolder();
    } catch (error) {
      if (error?.name !== "AbortError") {
        showStatus(memoryStatus, "The CV folder could not be connected.", true);
      }
    }
  });

  syncFolderButton.addEventListener("click", () => {
    void syncConnectedFolder(true);
  });

  disconnectFolderButton.addEventListener("click", async () => {
    try {
      await forgetCvFolderHandle();
      cvFolder = undefined;
      renderFolder();
      showStatus(
        memoryStatus,
        "Folder disconnected. Your existing professional memory was kept.",
      );
    } catch {
      showStatus(memoryStatus, "The folder could not be disconnected.", true);
    }
  });

  root.querySelector("#import-cvs-button").addEventListener("click", async () => {
    const selectedFiles = [...files.files];
    if (selectedFiles.length === 0) {
      showStatus(memoryStatus, "Select at least one PDF first.", true);
      return;
    }
    showStatus(memoryStatus, `Reading ${selectedFiles.length} CV${selectedFiles.length === 1 ? "" : "s"} locally...`);
    try {
      const { imported, duplicates } = await importEntries(
        selectedFiles.map((file) => ({ file, relativePath: file.name })),
      );
      showStatus(memoryStatus, `${imported} new CV${imported === 1 ? "" : "s"} imported${duplicates ? `, ${duplicates} existing source${duplicates === 1 ? "" : "s"} rechecked` : ""}. Your professional memory is ready.`);
    } catch {
      showStatus(memoryStatus, "One of the PDFs could not be read. No file was uploaded.", true);
    }
  });

  root.querySelector("#clear-memory-button").addEventListener("click", async () => {
    try {
      await clearMemory(chromeApi);
      memory = emptyProfessionalMemory();
      files.value = "";
      renderMemory(root, memory, form);
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
        memory.evidence.every((item) => item.status === "rejected"))
    ) {
      showStatus(status, "Add at least one target role and language. Import a CV or add one missing strength.", true);
      return;
    }

    try {
      await saveStoredProfile(chromeApi, settings);
      profileMode.textContent = "Your saved profile is active.";
      showStatus(status, "Profile saved. Job checks will now use your information.");
    } catch {
      showStatus(status, "Your profile could not be saved. Please try again.", true);
    }
  });

  resetButton.addEventListener("click", async () => {
    try {
      await clearStoredProfile(chromeApi);
      form.reset();
      profileMode.textContent =
        "No personal profile is saved. Screening now uses the repository demo profile.";
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
