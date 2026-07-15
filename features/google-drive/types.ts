export type DriveActionId =
  | "drive_search"
  | "drive_recent"
  | "drive_read_doc"
  | "drive_find_office"
  | "drive_download";

export type DriveOfficeFileType = "pdf" | "docx" | "xlsx" | "pptx";

export type DriveErrorCode =
  | "NOT_CONFIGURED"
  | "NOT_CONNECTED"
  | "AUTH_ERROR"
  | "NETWORK_ERROR"
  | "INVALID_INPUT"
  | "NOT_FOUND"
  | "UNKNOWN";

export class DriveApiError extends Error {
  readonly code: DriveErrorCode;
  readonly status?: number;

  constructor(code: DriveErrorCode, message: string, options?: { status?: number; cause?: unknown }) {
    super(message, { cause: options?.cause });
    this.name = "DriveApiError";
    this.code = code;
    this.status = options?.status;
  }
}

export type GoogleDriveFile = {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  sizeBytes?: number;
  webViewLink?: string;
};

export type FileSummary = {
  id: string;
  name: string;
  mimeType: string;
  mimeLabel: string;
  modifiedTime: string;
  modifiedLabel: string;
  sizeBytes?: number;
  webViewLink?: string;
};

export type DriveToolInput = {
  actionId: DriveActionId;
  /** Termo de busca (drive_search). */
  query?: string;
  /** Nome do arquivo (drive_read_doc, drive_find_office, drive_download). */
  name?: string;
  fileId?: string;
  fileType?: DriveOfficeFileType;
  maxResults?: number;
};

export type DriveToolOutput = {
  actionId: DriveActionId;
  summary: string;
  data: Record<string, unknown>;
};

/** Limite de caracteres de conteúdo textual enviado ao Interpreter / AI Gateway. */
export const DRIVE_MAX_CONTENT_CHARS = 8_000;

