import type { DriveOfficeFileType, FileSummary, GoogleDriveFile } from "./types";

export type DriveProvider = {
  searchFiles(query: string, maxResults?: number): Promise<GoogleDriveFile[]>;
  listRecent(maxResults?: number): Promise<GoogleDriveFile[]>;
  findByName(name: string, mimeTypes?: string[]): Promise<GoogleDriveFile[]>;
  findOfficeByName(name: string, fileType?: DriveOfficeFileType): Promise<GoogleDriveFile[]>;
  getFileById(fileId: string): Promise<GoogleDriveFile | null>;
  exportFileContent(fileId: string, exportMime: string): Promise<string>;
  downloadFileBinary(fileId: string, maxBytes: number): Promise<Uint8Array>;
  toFileSummary(file: GoogleDriveFile): FileSummary;
};
