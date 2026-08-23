import { candidateProfile } from "./candidate-profile.js";

export const PROFILE_STORAGE_KEY = "candidateProfileSettings";

function cleanValues(values = []) {
  return [...new Set(values.map((value) => String(value).trim()).filter(Boolean))];
}

function titleRule(value) {
  return {
    label: value,
    titlePatterns: [value],
  };
}

function locationRule(value) {
  return {
    label: value,
    patterns: [value],
  };
}

function languageRule(value) {
  const normalized = value.toLowerCase();
  const aliases =
    normalized === "german"
      ? ["german", "deutsch", "deutschkenntnisse"]
      : [value];

  return {
    label: value,
    aliases,
  };
}

function strengthRule(value) {
  return {
    label: value,
    weight: 4,
    patterns: [value],
  };
}

export function buildCandidateProfile(settings, baseProfile = candidateProfile) {
  if (!settings?.configured) {
    return baseProfile;
  }

  const targetRoles = cleanValues(settings.targetRoles);
  const potentialRoles = cleanValues(settings.potentialRoles);
  const skipRoles = cleanValues(settings.skipRoles);
  const preferredSeniority = cleanValues(settings.preferredSeniority);
  const potentialSeniority = cleanValues(settings.potentialSeniority);
  const skipSeniority = cleanValues(settings.skipSeniority);
  const preferredLocations = cleanValues(settings.preferredLocations);
  const verifiedLanguages = cleanValues(settings.verifiedLanguages).map((value) =>
    value.toLowerCase(),
  );
  const unavailableLanguages = cleanValues(settings.unavailableLanguages);
  const strengths = cleanValues(settings.strengths);
  const declaredLanguages = new Set([
    ...verifiedLanguages,
    ...unavailableLanguages.map((value) => value.toLowerCase()),
  ]);

  return {
    ...baseProfile,
    roleFit: {
      ...baseProfile.roleFit,
      strong: targetRoles.map(titleRule),
      potential: potentialRoles.map(titleRule),
      usuallySkip: skipRoles.map(titleRule),
      deepCodingRequirementPatterns: [],
    },
    seniority: {
      ...baseProfile.seniority,
      preferred: preferredSeniority.map((value) => value.toLowerCase()),
      potential: potentialSeniority.map((value) => value.toLowerCase()),
      usuallySkip: skipSeniority.map((value) => value.toLowerCase()),
    },
    location: {
      ...baseProfile.location,
      preferred: preferredLocations.map(locationRule),
      potential: [],
      relocationRequiredPatterns: [],
      onsiteRequiredPatterns: [],
    },
    languages: {
      ...baseProfile.languages,
      verified: verifiedLanguages,
      unavailable: unavailableLanguages.map(languageRule),
      otherRecognizedLanguages: baseProfile.languages.otherRecognizedLanguages.filter(
        (language) => !declaredLanguages.has(language.toLowerCase()),
      ),
    },
    strengthSignals: strengths.map(strengthRule),
  };
}

function readSettings(chromeApi) {
  if (!chromeApi.storage?.local) {
    return Promise.resolve(undefined);
  }

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

export async function loadCandidateProfile(chromeApi) {
  const settings = await readSettings(chromeApi);

  return {
    profile: buildCandidateProfile(settings),
    isConfigured: Boolean(settings?.configured),
  };
}
