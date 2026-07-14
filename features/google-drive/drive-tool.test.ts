import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getGoogleDriveProviderForCompanyMock = vi.fn();

vi.mock("./google-drive.provider", async (importOriginal) => {
  const original = await importOriginal<typeof import("./google-drive.provider")>();
  return {
    ...original,
    getGoogleDriveProviderForCompany: getGoogleDriveProviderForCompanyMock,
  };
});

const { DriveTool } = await import("./drive-tool");

const VALID_COMPANY_ID = "dc8a6425-e184-4730-9b9d-df4e999e5b61";

function createProviderMock() {
  const proposal = {
    id: "file-1",
    name: "Proposta Comercial",
    mimeType: "application/vnd.google-apps.document",
    modifiedTime: "2026-07-13T10:00:00.000Z",
    webViewLink: "https://docs.google.com/document/d/file-1",
  };

  return {
    searchFiles: vi.fn().mockResolvedValue([proposal]),
    listRecent: vi.fn().mockResolvedValue([proposal]),
    findByName: vi.fn().mockResolvedValue([proposal]),
    findOfficeByName: vi.fn().mockResolvedValue([proposal]),
    getFileById: vi.fn().mockResolvedValue(proposal),
    exportFileContent: vi.fn().mockResolvedValue("Texto da proposta comercial."),
    downloadFileBinary: vi.fn().mockResolvedValue(new TextEncoder().encode("%PDF")),
    resolveExportMime: vi.fn(() => "text/plain"),
    isBinaryOfficeMime: vi.fn(() => false),
    toFileSummary: vi.fn((file: typeof proposal) => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      mimeLabel: "Google Doc",
      modifiedTime: file.modifiedTime,
      modifiedLabel: "13/07/2026",
      webViewLink: file.webViewLink,
    })),
  };
}

let originalKillSwitch: string | undefined;

beforeEach(() => {
  originalKillSwitch = process.env.SAMUEL_GOOGLE_DRIVE_TOOL_ENABLED;
  delete process.env.SAMUEL_GOOGLE_DRIVE_TOOL_ENABLED;
  getGoogleDriveProviderForCompanyMock.mockReset();
  getGoogleDriveProviderForCompanyMock.mockResolvedValue(createProviderMock());
});

afterEach(() => {
  if (originalKillSwitch === undefined) delete process.env.SAMUEL_GOOGLE_DRIVE_TOOL_ENABLED;
  else process.env.SAMUEL_GOOGLE_DRIVE_TOOL_ENABLED = originalKillSwitch;
});

describe("DriveTool", () => {
  const tool = new DriveTool();

  it("busca arquivos via drive_search", async () => {
    const result = await tool.execute({
      organizationId: "org",
      companyId: VALID_COMPANY_ID,
      input: { actionId: "drive_search", query: "Proposta" },
    });

    expect(result.summary).toContain('para "Proposta"');
    expect(result.data.fileCount).toBe(1);
  });

  it("lista recentes via drive_recent", async () => {
    const result = await tool.execute({
      organizationId: "org",
      companyId: VALID_COMPANY_ID,
      input: { actionId: "drive_recent" },
    });

    expect(result.summary).toContain("modificados recentemente");
    expect(result.data.fileCount).toBe(1);
  });

  it("lê Google Doc via drive_read_doc", async () => {
    const result = await tool.execute({
      organizationId: "org",
      companyId: VALID_COMPANY_ID,
      input: { actionId: "drive_read_doc", name: "Proposta Comercial" },
    });

    expect(result.summary).toContain("lido com sucesso");
    expect(result.data.hasContent).toBe(true);
    expect(result.data.content).toContain("Texto da proposta");
  });

  it("localiza office via drive_find_office", async () => {
    const result = await tool.execute({
      organizationId: "org",
      companyId: VALID_COMPANY_ID,
      input: { actionId: "drive_find_office", name: "Relatório", fileType: "pdf" },
    });

    expect(result.data.fileCount).toBe(1);
  });

  it("extrai conteúdo via drive_download", async () => {
    const result = await tool.execute({
      organizationId: "org",
      companyId: VALID_COMPANY_ID,
      input: { actionId: "drive_download", name: "Proposta Comercial" },
    });

    expect(result.summary).toContain("Conteúdo extraído");
    expect(result.data.hasContent).toBe(true);
  });

  it("extrai PDF binário via drive_download", async () => {
    const { PDFDocument, StandardFonts } = await import("pdf-lib");
    const doc = await PDFDocument.create();
    const page = doc.addPage();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    page.drawText("Relatorio PDF", { x: 50, y: 700, size: 12, font });
    const pdfBytes = new Uint8Array(await doc.save());

    getGoogleDriveProviderForCompanyMock.mockResolvedValue({
      ...createProviderMock(),
      findOfficeByName: vi.fn().mockResolvedValue([
        {
          id: "pdf-1",
          name: "Relatorio.pdf",
          mimeType: "application/pdf",
          modifiedTime: "2026-07-13T10:00:00.000Z",
        },
      ]),
      resolveExportMime: vi.fn(() => null),
      isBinaryOfficeMime: vi.fn(() => true),
      downloadFileBinary: vi.fn().mockResolvedValue(pdfBytes),
      toFileSummary: vi.fn(() => ({
        id: "pdf-1",
        name: "Relatorio.pdf",
        mimeType: "application/pdf",
        mimeLabel: "PDF",
        modifiedTime: "2026-07-13T10:00:00.000Z",
        modifiedLabel: "13/07/2026",
      })),
    });

    const result = await tool.execute({
      organizationId: "org",
      companyId: VALID_COMPANY_ID,
      input: { actionId: "drive_download", name: "Relatorio", fileType: "pdf" },
    });

    expect(result.data.hasContent).toBe(true);
    expect(result.data.binaryParsed).toBe(true);
    expect(String(result.data.content).toLowerCase()).toContain("relatorio");
  });

  it("respeita kill-switch", async () => {
    process.env.SAMUEL_GOOGLE_DRIVE_TOOL_ENABLED = "false";

    await expect(
      tool.execute({
        organizationId: "org",
        companyId: VALID_COMPANY_ID,
        input: { actionId: "drive_recent" },
      }),
    ).rejects.toThrow(/desabilitada/i);
  });
});
