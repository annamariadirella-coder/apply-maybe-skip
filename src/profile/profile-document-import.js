import { extractCareerDocument } from "./career-intelligence.js";
import { readDocxText } from "./docx-text.js";
import { readPdfText } from "./pdf-profile-import.js";

async function fileId(file) {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return [...new Uint8Array(digest)]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

async function readDocumentText(file) {
  const name = file.name.toLowerCase();

  if (name.endsWith(".pdf")) return readPdfText(file);
  if (name.endsWith(".docx")) return readDocxText(file);
  if (name.endsWith(".txt") || name.endsWith(".md")) return file.text();

  throw new Error("Choose a PDF, DOCX, TXT, or Markdown file.");
}

export async function importProfileDocument(file, relativePath = file.name) {
  const [id, text] = await Promise.all([fileId(file), readDocumentText(file)]);
  const parsed = extractCareerDocument(text, file.name);

  return {
    source: {
      id,
      name: file.name,
      size: file.size,
      lastModified: file.lastModified,
      importedAt: new Date().toISOString(),
      relativePath,
    },
    parsed,
  };
}
