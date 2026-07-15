import { resolveGmailAccessToken } from "@/integrations/gmail";

import type { DriveProvider } from "./drive-provider";
import {
  DriveApiError,
  type DriveOfficeFileType,
  type FileSummary,
  type GoogleDriveFile,
} from "./types";

const DRIVE_API_BASE = "https://www.googleapis.com/drive/v3";
const DEFAULT_MAX_RESULTS = 25;
const FILE_FIELDS = "files(id,name,mimeType,modifiedTime,size,webViewLink),nextPageToken";

const MIME_LABELS: Record<string, string> = {
  "application/vnd.google-apps.document": "Google Doc",
  "application/vnd.google-apps.spreadsheet": "Google Planilha",
  "application/vnd.google-apps.presentation": "Google Apresentação",
  "application/pdf": "PDF",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word (DOCX)",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Excel (XLSX)",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PowerPoint (PPTX)",
};

const OFFICE_MIME_GROUPS: Record<DriveOfficeFileType, string[]> = {
  pdf: ["application/pdf"],
  docx: [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.google-apps.document",
  ],
  xlsx: [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.google-apps.spreadsheet",
  ],
  pptx: [
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.google-apps.presentation",
  ],
};

const EXPORT_MIME_BY_NATIVE: Record<string, string> = {
  "application/vnd.google-apps.document": "text/plain",
  "application/vnd.google-apps.spreadsheet": "text/csv",
  "application/vnd.google-apps.presentation": "text/plain",
};

type GoogleFilesListResponse = {
  files?: Array<{
    id?: string;
    name?: string;
    mimeType?: string;
    modifiedTime?: string;
    size?: string;
    webViewLink?: string;
  }>;
  nextPageToken?: string;
};

function mapHttpError(status: number, body: string): never {
  if (status === 401) {
    throw new DriveApiError(
      "AUTH_ERROR",
      "Token de acesso do Google expirado ou inválido — pode ser necessário reconectar a conta.",
      { status },
    );
  }
  if (status === 403) {
    throw new DriveApiError(
      "AUTH_ERROR",
      "Permissões insuficientes para Google Drive (verifique os scopes concedidos no OAuth).",
      { status },
    );
  }
  throw new DriveApiError("UNKNOWN", `Erro na Google Drive API (status ${status}): ${body}`, {
    status,
  });
}

function escapeDriveQuery(value: string): string {
  return value.replace(/'/g, "\\'");
}

function formatModifiedLabel(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function mimeLabel(mimeType: string): string {
  return MIME_LABELS[mimeType] ?? mimeType;
}

function parseFile(raw: GoogleFilesListResponse["files"] extends (infer T)[] | undefined ? T : never): GoogleDriveFile | null {
  if (!raw?.id || !raw.name || !raw.mimeType || !raw.modifiedTime) return null;
  return {
    id: raw.id,
    name: raw.name,
    mimeType: raw.mimeType,
    modifiedTime: raw.modifiedTime,
    sizeBytes: raw.size ? Number.parseInt(raw.size, 10) : undefined,
    webViewLink: raw.webViewLink,
  };
}

export class GoogleDriveProvider implements DriveProvider {
  constructor(private readonly accessToken: string) {}

  private async requestText(
    path: string,
    init?: { method?: string; query?: Record<string, string | number | undefined>; accept?: string },
  ): Promise<string> {
    const url = new URL(`${DRIVE_API_BASE}${path}`);
    if (init?.query) {
      for (const [key, value] of Object.entries(init.query)) {
        if (value !== undefined) url.searchParams.set(key, String(value));
      }
    }

    let response: Response;
    try {
      response = await fetch(url.toString(), {
        method: init?.method ?? "GET",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          Accept: init?.accept ?? "application/json",
        },
        cache: "no-store",
      });
    } catch (error) {
      throw new DriveApiError("NETWORK_ERROR", "Falha de rede ao consultar a Google Drive API.", {
        cause: error,
      });
    }

    if (!response.ok) {
      mapHttpError(response.status, await response.text());
    }

    return response.text();
  }

  private async requestJson<T>(
    path: string,
    query?: Record<string, string | number | undefined>,
  ): Promise<T> {
    const text = await this.requestText(path, { query, accept: "application/json" });
    return JSON.parse(text) as T;
  }

  private async listFiles(options: {
    q: string;
    maxResults?: number;
    orderBy?: string;
  }): Promise<GoogleDriveFile[]> {
    const files: GoogleDriveFile[] = [];
    let pageToken: string | undefined;
    const pageSize = Math.min(options.maxResults ?? DEFAULT_MAX_RESULTS, 100);

    do {
      const response = await this.requestJson<GoogleFilesListResponse>("/files", {
        q: options.q,
        pageSize,
        pageToken,
        orderBy: options.orderBy,
        fields: FILE_FIELDS,
        supportsAllDrives: "true",
        includeItemsFromAllDrives: "true",
      });

      for (const item of response.files ?? []) {
        const parsed = parseFile(item);
        if (parsed) files.push(parsed);
        if (files.length >= (options.maxResults ?? DEFAULT_MAX_RESULTS)) break;
      }

      pageToken =
        files.length < (options.maxResults ?? DEFAULT_MAX_RESULTS) ? response.nextPageToken : undefined;
    } while (pageToken && files.length < (options.maxResults ?? DEFAULT_MAX_RESULTS));

    return files;
  }

  toFileSummary(file: GoogleDriveFile): FileSummary {
    return {
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      mimeLabel: mimeLabel(file.mimeType),
      modifiedTime: file.modifiedTime,
      modifiedLabel: formatModifiedLabel(file.modifiedTime),
      sizeBytes: file.sizeBytes,
      webViewLink: file.webViewLink,
    };
  }

  async searchFiles(query: string, maxResults = DEFAULT_MAX_RESULTS): Promise<GoogleDriveFile[]> {
    const term = escapeDriveQuery(query.trim());
    return this.listFiles({
      q: `name contains '${term}' and trashed=false`,
      maxResults,
      orderBy: "modifiedTime desc",
    });
  }

  async listRecent(maxResults = DEFAULT_MAX_RESULTS): Promise<GoogleDriveFile[]> {
    return this.listFiles({
      q: "trashed=false",
      maxResults,
      orderBy: "modifiedTime desc",
    });
  }

  async findByName(name: string, mimeTypes?: string[]): Promise<GoogleDriveFile[]> {
    const escaped = escapeDriveQuery(name.trim());
    let q = `name contains '${escaped}' and trashed=false`;
    if (mimeTypes && mimeTypes.length > 0) {
      const mimeClause = mimeTypes.map((mime) => `mimeType='${mime}'`).join(" or ");
      q += ` and (${mimeClause})`;
    }
    return this.listFiles({ q, maxResults: 10, orderBy: "modifiedTime desc" });
  }

  async findOfficeByName(name: string, fileType?: DriveOfficeFileType): Promise<GoogleDriveFile[]> {
    const mimeTypes = fileType ? OFFICE_MIME_GROUPS[fileType] : Object.values(OFFICE_MIME_GROUPS).flat();
    return this.findByName(name, mimeTypes);
  }

  async getFileById(fileId: string): Promise<GoogleDriveFile | null> {
    try {
      const raw = await this.requestJson<{
        id?: string;
        name?: string;
        mimeType?: string;
        modifiedTime?: string;
        size?: string;
        webViewLink?: string;
      }>(`/files/${fileId}`, {
        fields: "id,name,mimeType,modifiedTime,size,webViewLink",
        supportsAllDrives: "true",
      });
      return parseFile(raw);
    } catch (error) {
      if (error instanceof DriveApiError) {
        return null;
      }
      throw error;
    }
  }

  async exportFileContent(fileId: string, exportMime: string): Promise<string> {
    return this.requestText(`/files/${fileId}/export`, {
      query: { mimeType: exportMime },
      accept: exportMime,
    });
  }

  async downloadFileBinary(fileId: string, maxBytes: number): Promise<Uint8Array> {
    const url = new URL(`${DRIVE_API_BASE}/files/${fileId}`);
    url.searchParams.set("alt", "media");
    url.searchParams.set("supportsAllDrives", "true");

    let response: Response;
    try {
      response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
        cache: "no-store",
      });
    } catch (error) {
      throw new DriveApiError("NETWORK_ERROR", "Falha de rede ao baixar arquivo do Google Drive.", {
        cause: error,
      });
    }

    if (!response.ok) {
      mapHttpError(response.status, await response.text());
    }

    const contentLength = response.headers.get("content-length");
    if (contentLength) {
      const declared = Number.parseInt(contentLength, 10);
      if (!Number.isNaN(declared) && declared > maxBytes) {
        throw new DriveApiError(
          "INVALID_INPUT",
          `Arquivo excede o limite de download (${Math.round(maxBytes / (1024 * 1024))} MB).`,
        );
      }
    }

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > maxBytes) {
      throw new DriveApiError(
        "INVALID_INPUT",
        `Arquivo excede o limite de download (${Math.round(maxBytes / (1024 * 1024))} MB).`,
      );
    }

    return new Uint8Array(buffer);
  }

  resolveExportMime(mimeType: string): string | null {
    return EXPORT_MIME_BY_NATIVE[mimeType] ?? null;
  }

  isBinaryOfficeMime(mimeType: string): boolean {
    return [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ].includes(mimeType);
  }
}

/** Reutiliza OAuth/token refresh da Sprint 86 — sem duplicar implementação. */
export async function getGoogleDriveProviderForCompany(
  companyId: string,
): Promise<GoogleDriveProvider> {
  try {
    const accessToken = await resolveGmailAccessToken(companyId);
    return new GoogleDriveProvider(accessToken);
  } catch (error) {
    const message = error instanceof Error ? error.message : "erro desconhecido";
    if (message.includes("Nenhuma conta Gmail conectada") || message.includes("NOT_CONNECTED")) {
      throw new DriveApiError(
        "NOT_CONNECTED",
        `Nenhuma conta Google conectada para a empresa "${companyId}". Conecte em /debug/gmail-connect.`,
      );
    }
    if (message.includes("não configurada") || message.includes("NOT_CONFIGURED")) {
      throw new DriveApiError("NOT_CONFIGURED", message);
    }
    throw new DriveApiError("UNKNOWN", message, { cause: error });
  }
}

export function formatFileLine(file: FileSummary): string {
  const size =
    file.sizeBytes != null ? ` — ${Math.round(file.sizeBytes / 1024)} KB` : "";
  return `${file.name} (${file.mimeLabel}, ${file.modifiedLabel})${size}`;
}

export function truncateContent(content: string, maxChars: number): string {
  if (content.length <= maxChars) return content;
  return `${content.slice(0, maxChars)}\n\n[conteúdo truncado]`;
}

