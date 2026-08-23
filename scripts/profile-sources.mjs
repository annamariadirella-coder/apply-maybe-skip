import { createHash } from "node:crypto";
import {
  existsSync,
  promises as fs,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");
const configPath = path.join(repositoryRoot, ".candidate-profile.local.json");
const acceptCurrentState = process.argv.includes("--accept");
const ignoredFilenames = new Set(["desktop.ini", "thumbs.db", ".ds_store"]);

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function walk(directory, excludedDirectory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (path.resolve(fullPath) !== excludedDirectory) {
        files.push(...(await walk(fullPath, excludedDirectory)));
      }
      continue;
    }

    if (entry.isFile() && !ignoredFilenames.has(entry.name.toLowerCase())) {
      files.push(fullPath);
    }
  }

  return files;
}

async function fingerprint(filePath, sourceDirectory) {
  const [content, stats] = await Promise.all([
    fs.readFile(filePath),
    fs.stat(filePath),
  ]);

  return {
    path: path.relative(sourceDirectory, filePath).replaceAll("\\", "/"),
    size: stats.size,
    modifiedTime: stats.mtime.toISOString(),
    sha256: createHash("sha256").update(content).digest("hex"),
  };
}

function compare(currentFiles, indexedFiles) {
  const current = new Map(currentFiles.map((file) => [file.path, file]));
  const indexed = new Map(indexedFiles.map((file) => [file.path, file]));

  return {
    added: currentFiles.filter((file) => !indexed.has(file.path)),
    changed: currentFiles.filter(
      (file) =>
        indexed.has(file.path) && indexed.get(file.path).sha256 !== file.sha256,
    ),
    removed: indexedFiles.filter((file) => !current.has(file.path)),
  };
}

function printGroup(label, files) {
  console.log(`${label}: ${files.length}`);
  files.slice(0, 30).forEach((file) => console.log(`  - ${file.path}`));

  if (files.length > 30) {
    console.log(`  ... and ${files.length - 30} more`);
  }
}

if (!existsSync(configPath)) {
  fail(
    "Missing .candidate-profile.local.json. Copy the local config for this machine before checking profile sources.",
  );
} else {
  const config = await readJson(configPath);
  const sourceDirectory = path.resolve(config.sourceDirectory);
  const canonicalProfile = path.resolve(config.canonicalProfile);
  const indexFile = path.resolve(config.indexFile);
  const excludedDirectory = path.resolve(path.dirname(indexFile));

  if (!existsSync(sourceDirectory)) {
    fail(`Candidate source directory does not exist: ${sourceDirectory}`);
  } else if (!existsSync(canonicalProfile)) {
    fail(`Canonical candidate profile does not exist: ${canonicalProfile}`);
  } else {
    const sourceFiles = await walk(sourceDirectory, excludedDirectory);
    const currentFiles = (
      await Promise.all(
        sourceFiles.map((file) => fingerprint(file, sourceDirectory)),
      )
    ).sort((left, right) => left.path.localeCompare(right.path));
    const previousIndex = existsSync(indexFile)
      ? await readJson(indexFile)
      : { files: [] };
    const changes = compare(currentFiles, previousIndex.files ?? []);

    console.log(`Candidate source directory: ${sourceDirectory}`);
    console.log(`Canonical candidate profile: ${canonicalProfile}`);
    console.log(`Indexed source files: ${currentFiles.length}`);
    printGroup("New", changes.added);
    printGroup("Changed", changes.changed);
    printGroup("Removed", changes.removed);

    if (acceptCurrentState) {
      await fs.mkdir(path.dirname(indexFile), { recursive: true });
      await fs.writeFile(
        indexFile,
        `${JSON.stringify(
          {
            schemaVersion: 1,
            acceptedAt: new Date().toISOString(),
            files: currentFiles,
          },
          null,
          2,
        )}\n`,
        "utf8",
      );
      console.log(`Accepted current source state: ${indexFile}`);
    } else if (
      changes.added.length ||
      changes.changed.length ||
      changes.removed.length
    ) {
      console.log(
        "Review these files and update the canonical profile before running npm run profile:index.",
      );
    } else {
      console.log("Profile sources are fully reconciled with the current index.");
    }
  }
}
