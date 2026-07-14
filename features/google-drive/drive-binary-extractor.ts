import JSZip from "jszip";
import mammoth from "mammoth";
import * as XLSX from "xlsx";

/** Limite de download de binários (PDF/DOCX/XLSX/PPTX) — proteção de memória. */
export const DRIVE_MAX_DOWNLOAD_BYTES = 15 * 1024 * 1024;

const SUPPORTED_BINARY_MIMES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

function normalizeExtractedText(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

async function extractPdfText(data: Uint8Array): Promise<string> {
  const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const pdf = await getDocument({ data, useSystemFonts: true }).promise;
  const parts: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ("str" in item && typeof item.str === "string" ? item.str : ""))
      .join(" ");
    if (pageText.trim()) parts.push(pageText);
  }

  return normalizeExtractedText(parts.join("\n"));
}

async function extractDocxText(data: Uint8Array): Promise<string> {
  const result = await mammoth.extractRawText({ buffer: Buffer.from(data) });
  return normalizeExtractedText(result.value ?? "");
}

function extractXlsxText(data: Uint8Array): string {
  const workbook = XLSX.read(Buffer.from(data), { type: "buffer", cellDates: true });
  const sections: string[] = [];

  for (const sheetName of workbook.SheetNames.slice(0, 5)) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;
    const csv = XLSX.utils.sheet_to_csv(sheet, { FS: "\t", blankrows: false });
    if (csv.trim()) {
      sections.push(`[${sheetName}]\n${csv.trim()}`);
    }
  }

  return normalizeExtractedText(sections.join("\n\n"));
}

async function extractPptxText(data: Uint8Array): Promise<string> {
  const zip = await JSZip.loadAsync(data);
  const slidePaths = Object.keys(zip.files)
    .filter((path) => /^ppt\/slides\/slide\d+\.xml$/i.test(path))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const slides: string[] = [];
  for (const path of slidePaths) {
    const xml = await zip.files[path].async("string");
    const texts = [...xml.matchAll(/<a:t(?:\s[^>]*)?>([^<]*)<\/a:t>/g)]
      .map((match) => match[1]?.trim())
      .filter(Boolean);
    if (texts.length > 0) {
      slides.push(texts.join(" "));
    }
  }

  return normalizeExtractedText(slides.join("\n"));
}

/**
 * Extrai texto de binários Office/PDF baixados do Google Drive.
 * Devolve string vazia quando o formato não é suportado ou o parse falha.
 */
export async function extractTextFromBinary(mimeType: string, data: Uint8Array): Promise<string> {
  if (!SUPPORTED_BINARY_MIMES.has(mimeType)) return "";
  if (data.byteLength === 0 || data.byteLength > DRIVE_MAX_DOWNLOAD_BYTES) return "";

  try {
    switch (mimeType) {
      case "application/pdf":
        return await extractPdfText(data);
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return await extractDocxText(data);
      case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        return extractXlsxText(data);
      case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        return await extractPptxText(data);
      default:
        return "";
    }
  } catch {
    return "";
  }
}

export function isSupportedBinaryMime(mimeType: string): boolean {
  return SUPPORTED_BINARY_MIMES.has(mimeType);
}
