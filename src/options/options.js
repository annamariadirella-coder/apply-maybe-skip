import { PROFILE_STORAGE_KEY } from "../profile/profile-settings.js";

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

  try {
    populateForm(form, await readStoredProfile(chromeApi));
  } catch {
    showStatus(status, "Your saved profile could not be loaded.", true);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const settings = collectSettings(form);

    if (
      settings.targetRoles.length === 0 ||
      settings.verifiedLanguages.length === 0 ||
      settings.strengths.length === 0
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
