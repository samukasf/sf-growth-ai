import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fromMock = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  supabase: { from: fromMock },
}));

const getGoogleDriveProviderForCompanyMock = vi.fn();
vi.mock("@/features/google-drive/google-drive.provider", () => ({
  getGoogleDriveProviderForCompany: getGoogleDriveProviderForCompanyMock,
  formatFileLine: (file: { name: string; mimeLabel: string; modifiedLabel: string }) =>
    `${file.name} (${file.mimeLabel}, ${file.modifiedLabel})`,
  truncateContent: (content: string) => content,
}));

const generateNarrativeViaAIGatewayMock = vi.fn();
vi.mock("./ai-gateway-narrative.adapter", () => ({
  generateNarrativeViaAIGateway: generateNarrativeViaAIGatewayMock,
}));

const { runSamuelRuntime } = await import("./samuel-runtime.service");

const VALID_COMPANY_ID = "dc8a6425-e184-4730-9b9d-df4e999e5b61";

function createProviderMock() {
  const doc = {
    id: "file-1",
    name: "Proposta Comercial",
    mimeType: "application/vnd.google-apps.document",
    modifiedTime: "2026-07-13T10:00:00.000Z",
    webViewLink: "https://docs.google.com/document/d/file-1",
  };

  return {
    searchFiles: vi.fn().mockResolvedValue([doc]),
    listRecent: vi.fn().mockResolvedValue([doc]),
    findByName: vi.fn().mockResolvedValue([doc]),
    findOfficeByName: vi.fn().mockResolvedValue([doc]),
    getFileById: vi.fn().mockResolvedValue(doc),
    exportFileContent: vi.fn().mockResolvedValue("A proposta comercial prevê crescimento de 20%."),
    resolveExportMime: vi.fn(() => "text/plain"),
    isBinaryOfficeMime: vi.fn(() => false),
    toFileSummary: vi.fn(() => ({
      id: doc.id,
      name: doc.name,
      mimeType: doc.mimeType,
      mimeLabel: "Google Doc",
      modifiedTime: doc.modifiedTime,
      modifiedLabel: "13/07/2026",
      webViewLink: doc.webViewLink,
    })),
  };
}

let originalToolCallingKillSwitch: string | undefined;
let originalDriveKillSwitch: string | undefined;
let originalInterpreterKillSwitch: string | undefined;
let originalConversationMemoryKillSwitch: string | undefined;

beforeEach(() => {
  originalToolCallingKillSwitch = process.env.SAMUEL_TOOL_CALLING_ENABLED;
  originalDriveKillSwitch = process.env.SAMUEL_GOOGLE_DRIVE_TOOL_ENABLED;
  originalInterpreterKillSwitch = process.env.SAMUEL_TOOL_INTERPRETER_ENABLED;
  originalConversationMemoryKillSwitch = process.env.SAMUEL_CONVERSATION_MEMORY_ENABLED;

  delete process.env.SAMUEL_TOOL_CALLING_ENABLED;
  delete process.env.SAMUEL_GOOGLE_DRIVE_TOOL_ENABLED;
  delete process.env.SAMUEL_TOOL_INTERPRETER_ENABLED;
  process.env.SAMUEL_CONVERSATION_MEMORY_ENABLED = "false";

  fromMock.mockReset();
  getGoogleDriveProviderForCompanyMock.mockReset();
  getGoogleDriveProviderForCompanyMock.mockResolvedValue(createProviderMock());
  generateNarrativeViaAIGatewayMock.mockReset().mockResolvedValue({
    narrative: "O documento Proposta Comercial prevê crescimento de 20%.",
    metadata: { used: true },
  });
});

afterEach(() => {
  const restore = (key: string, value: string | undefined) => {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  };
  restore("SAMUEL_TOOL_CALLING_ENABLED", originalToolCallingKillSwitch);
  restore("SAMUEL_GOOGLE_DRIVE_TOOL_ENABLED", originalDriveKillSwitch);
  restore("SAMUEL_TOOL_INTERPRETER_ENABLED", originalInterpreterKillSwitch);
  restore("SAMUEL_CONVERSATION_MEMORY_ENABLED", originalConversationMemoryKillSwitch);
});

describe("runSamuelRuntime — Google Drive Tool (Sprint 91)", () => {
  it("aciona google-drive para leitura de documento e interpreta sem JSON", async () => {
    const result = await runSamuelRuntime({
      query: "Leia o documento Proposta Comercial no Drive.",
      companyId: VALID_COMPANY_ID,
      animate: false,
    });

    expect(result.tooling).toMatchObject({
      attempted: true,
      toolName: "google-drive",
      status: "success",
    });
    expect(result.tooling.input).toMatchObject({ actionId: "drive_read_doc", name: "Proposta Comercial" });
    expect(generateNarrativeViaAIGatewayMock).toHaveBeenCalledWith(
      expect.objectContaining({
        conversationContext: expect.stringContaining("Google Drive Tool"),
      }),
    );
    expect(result.response.narrative).not.toContain('"fileCount"');
    expect(result.response.narrative).toContain("20%");
  });

  it("usa humanFallback legível quando o AI Gateway não responde", async () => {
    generateNarrativeViaAIGatewayMock.mockResolvedValue(null);

    const result = await runSamuelRuntime({
      query: "Leia o documento Proposta Comercial no Drive.",
      companyId: VALID_COMPANY_ID,
      animate: false,
    });

    expect(result.response.narrative).toContain("lido com sucesso");
    expect(result.response.narrative).not.toContain('"content"');
  });

  it("lista arquivos recentes via drive_recent", async () => {
    const result = await runSamuelRuntime({
      query: "Quais os arquivos recentes do Google Drive?",
      companyId: VALID_COMPANY_ID,
      animate: false,
    });

    expect(result.tooling.input).toMatchObject({ actionId: "drive_recent" });
    expect(result.tooling.status).toBe("success");
  });
});
