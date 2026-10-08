export const CURRENT_PROFILE_PARSER_VERSION = 3;

const DATABASE_NAME = "apply-maybe-skip-folders";
const STORE_NAME = "handles";
const CV_FOLDER_KEY = "cv-folder";

function openDatabase(indexedDb = globalThis.indexedDB) {
  return new Promise((resolve, reject) => {
    const request = indexedDb.open(DATABASE_NAME, 1);

    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function useStore(mode, operation, indexedDb) {
  const database = await openDatabase(indexedDb);

  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, mode);
      const request = operation(transaction.objectStore(STORE_NAME));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      transaction.onerror = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
}

export function saveCvFolderHandle(handle, indexedDb = globalThis.indexedDB) {
  return useStore("readwrite", (store) => store.put(handle, CV_FOLDER_KEY), indexedDb);
}

export function loadCvFolderHandle(indexedDb = globalThis.indexedDB) {
  return useStore("readonly", (store) => store.get(CV_FOLDER_KEY), indexedDb);
}

export function forgetCvFolderHandle(indexedDb = globalThis.indexedDB) {
  return useStore("readwrite", (store) => store.delete(CV_FOLDER_KEY), indexedDb);
}

export async function folderPermission(handle, request = false) {
  const options = { mode: "read" };
  const current = await handle.queryPermission(options);

  if (current === "granted" || !request) {
    return current;
  }

  return handle.requestPermission(options);
}

export async function listPdfFiles(directoryHandle, parentPath = "") {
  const files = [];

  for await (const [name, handle] of directoryHandle.entries()) {
    const relativePath = parentPath ? `${parentPath}/${name}` : name;

    if (handle.kind === "directory") {
      files.push(...(await listPdfFiles(handle, relativePath)));
      continue;
    }

    if (handle.kind === "file" && name.toLowerCase().endsWith(".pdf")) {
      files.push({ file: await handle.getFile(), relativePath });
    }
  }

  return files.sort((left, right) =>
    left.relativePath.localeCompare(right.relativePath),
  );
}

function pathKey(value = "") {
  return String(value).replace(/\\/g, "/").toLowerCase();
}

export function filesNeedingSync(files, memory) {
  const sources = memory?.sources ?? [];

  return files.filter(({ file, relativePath }) => {
    const matchingSource = sources.find((source) => {
      const sourcePath = source.relativePath || source.name;
      return pathKey(sourcePath) === pathKey(relativePath);
    });

    return (
      !matchingSource ||
      matchingSource.size !== file.size ||
      matchingSource.lastModified !== file.lastModified ||
      matchingSource.parserVersion !== CURRENT_PROFILE_PARSER_VERSION
    );
  });
}
