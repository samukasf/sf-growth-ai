import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GoogleDriveProvider, truncateContent } from "./google-drive.provider";

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("GoogleDriveProvider — chamadas reais à API", () => {
  const provider = new GoogleDriveProvider("test-access-token");

  it("pesquisa arquivos via Google Drive API v3", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          files: [
            {
              id: "file-1",
              name: "Proposta Comercial",
              mimeType: "application/vnd.google-apps.document",
              modifiedTime: "2026-07-13T10:00:00.000Z",
              webViewLink: "https://docs.google.com/document/d/file-1",
            },
          ],
        }),
    });

    const files = await provider.searchFiles("Proposta");

    expect(files).toHaveLength(1);
    expect(files[0].name).toBe("Proposta Comercial");
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("https://www.googleapis.com/drive/v3/files"),
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer test-access-token",
        }),
      }),
    );
    expect(fetchMock.mock.calls[0][0]).toContain("name+contains");
  });

  it("exporta conteúdo de Google Doc como text/plain", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => "Conteúdo do documento de teste.",
    });

    const content = await provider.exportFileContent("file-1", "text/plain");

    expect(content).toContain("Conteúdo do documento");
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/files/file-1/export"),
      expect.objectContaining({
        method: "GET",
      }),
    );
  });

  it("baixa binário via alt=media", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-length": "4" }),
      arrayBuffer: async () => new TextEncoder().encode("%PDF").buffer,
    });

    const bytes = await provider.downloadFileBinary("file-pdf", 1024 * 1024);

    expect(bytes).toHaveLength(4);
    expect(fetchMock.mock.calls[0][0]).toContain("alt=media");
  });

  it("resolve export mime para Google Docs", () => {
    expect(provider.resolveExportMime("application/vnd.google-apps.document")).toBe("text/plain");
    expect(provider.resolveExportMime("application/pdf")).toBeNull();
  });
});

describe("truncateContent", () => {
  it("trunca conteúdo acima do limite", () => {
    const long = "a".repeat(100);
    expect(truncateContent(long, 50)).toContain("[conteúdo truncado]");
    expect(truncateContent(long, 50).length).toBeLessThan(100);
  });
});
