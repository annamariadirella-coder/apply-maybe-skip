import * as pdfjsLib from "../../vendor/pdfjs/pdf.min.mjs";
import {
  extractRoleEvidence,
  extractSkillEvidence,
} from "./professional-memory.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL(
  "vendor/pdfjs/pdf.worker.min.mjs",
);

async function fileId(file) {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return [...new Uint8Array(digest)]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

export async function readPdfText(file) {
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const pages = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push(
      content.items
        .map((item) => `${item.str}${item.hasEOL ? "\n" : " "}`)
        .join("")
        .trim(),
    );
  }

  return pages.join("\n");
}

export async function importPdf(file) {
  const [id, text] = await Promise.all([fileId(file), readPdfText(file)]);

  return {
    source: {
      id,
      name: file.name,
      size: file.size,
      lastModified: file.lastModified,
      importedAt: new Date().toISOString(),
    },
    candidates: extractSkillEvidence(text),
    roles: extractRoleEvidence(text),
  };
}
