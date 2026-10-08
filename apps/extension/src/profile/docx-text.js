function decodeXmlEntities(value) {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

export function extractDocxXmlText(xml = "") {
  return decodeXmlEntities(
    String(xml)
      .replace(/<w:tab\b[^>]*\/>/gi, "\t")
      .replace(/<w:(?:br|cr)\b[^>]*\/>/gi, "\n")
      .replace(/<\/w:p>/gi, "\n")
      .replace(/<[^>]+>/g, ""),
  )
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function endOfCentralDirectory(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const minimum = Math.max(0, bytes.length - 65_557);

  for (let offset = bytes.length - 22; offset >= minimum; offset -= 1) {
    if (view.getUint32(offset, true) === 0x06054b50) return offset;
  }

  throw new Error("This DOCX file is not a readable ZIP archive.");
}

function findZipEntry(bytes, wantedName) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const directory = endOfCentralDirectory(bytes);
  const entryCount = view.getUint16(directory + 10, true);
  let offset = view.getUint32(directory + 16, true);
  const decoder = new TextDecoder();

  for (let index = 0; index < entryCount; index += 1) {
    if (view.getUint32(offset, true) !== 0x02014b50) break;

    const method = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const fileNameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const localOffset = view.getUint32(offset + 42, true);
    const name = decoder.decode(
      bytes.subarray(offset + 46, offset + 46 + fileNameLength),
    );

    if (name === wantedName) {
      if (view.getUint32(localOffset, true) !== 0x04034b50) {
        throw new Error("The DOCX document entry is invalid.");
      }

      const localNameLength = view.getUint16(localOffset + 26, true);
      const localExtraLength = view.getUint16(localOffset + 28, true);
      const start = localOffset + 30 + localNameLength + localExtraLength;

      return {
        method,
        bytes: bytes.slice(start, start + compressedSize),
      };
    }

    offset += 46 + fileNameLength + extraLength + commentLength;
  }

  throw new Error("The DOCX file does not contain word/document.xml.");
}

async function inflate(entry) {
  if (entry.method === 0) return entry.bytes;
  if (entry.method !== 8 || typeof DecompressionStream !== "function") {
    throw new Error("This DOCX compression method is not supported.");
  }

  const stream = new Blob([entry.bytes])
    .stream()
    .pipeThrough(new DecompressionStream("deflate-raw"));

  return new Uint8Array(await new Response(stream).arrayBuffer());
}

export async function readDocxText(file) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const entry = findZipEntry(bytes, "word/document.xml");
  const xml = new TextDecoder().decode(await inflate(entry));

  return extractDocxXmlText(xml);
}
