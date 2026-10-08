import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CURRENT_PROFILE_PARSER_VERSION,
  filesNeedingSync,
  listPdfFiles,
} from "../src/profile/cv-folder.js";

function file(name, size, lastModified) {
  return { name, size, lastModified };
}

function fileHandle(value) {
  return {
    kind: "file",
    async getFile() {
      return value;
    },
  };
}

function directory(entries) {
  return {
    kind: "directory",
    async *entries() {
      yield* entries;
    },
  };
}

test("connected folder discovery finds PDF files recursively", async () => {
  const root = directory([
    ["latest.pdf", fileHandle(file("latest.pdf", 20, 2))],
    ["notes.txt", fileHandle(file("notes.txt", 5, 1))],
    [
      "archive",
      directory([["older.PDF", fileHandle(file("older.PDF", 10, 1))]]),
    ],
  ]);

  const found = await listPdfFiles(root);

  assert.deepEqual(
    found.map((item) => item.relativePath),
    ["archive/older.PDF", "latest.pdf"],
  );
});

test("folder sync selects only new, modified, or legacy-parser PDFs", () => {
  const files = [
    { file: file("same.pdf", 10, 1), relativePath: "same.pdf" },
    { file: file("changed.pdf", 25, 3), relativePath: "changed.pdf" },
    { file: file("legacy.pdf", 30, 4), relativePath: "legacy.pdf" },
    { file: file("new.pdf", 40, 5), relativePath: "new.pdf" },
  ];
  const memory = {
    sources: [
      {
        relativePath: "same.pdf",
        size: 10,
        lastModified: 1,
        parserVersion: CURRENT_PROFILE_PARSER_VERSION,
      },
      {
        relativePath: "changed.pdf",
        size: 20,
        lastModified: 2,
        parserVersion: CURRENT_PROFILE_PARSER_VERSION,
      },
      { relativePath: "legacy.pdf", size: 30, lastModified: 4 },
    ],
  };

  assert.deepEqual(
    filesNeedingSync(files, memory).map((item) => item.relativePath),
    ["changed.pdf", "legacy.pdf", "new.pdf"],
  );
});
