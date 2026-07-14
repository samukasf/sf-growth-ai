import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fromMock = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  supabase: { from: fromMock },
}));

const getGmailClientForCompanyMock = vi.fn();
vi.mock("@/integrations/gmail", () => ({
  GmailApiError: class GmailApiError extends Error {
    readonly code = "UNKNOWN";
    constructor(message: string) {
      super(message);
      this.name = "GmailApiError";
    }
  },
  getGmailClientForCompany: getGmailClientForCompanyMock,
}));

const generateNarrativeViaAIGatewayMock = vi.fn();
vi.mock("./ai-gateway-narrative.adapter", () => ({
  generateNarrativeViaAIGateway: generateNarrativeViaAIGatewayMock,
}));

const { runSamuelRuntime } = await import("./samuel-runtime.service");

const VALID_COMPANY_ID = "dc8a6425-e184-4730-9b9d-df4e999e5b61";

function createClientMock() {
  return {
    getInboxSummary: vi.fn().mockResolvedValue({
      emailAddress: "empresa@gmail.com",
      unreadCount: 1,
      messages: [
        {
          id: "m1",
          threadId: "t1",
          subject: "Proposta comercial",
          from: "cliente@empresa.com",
          snippet: "Segue proposta em anexo",
          date: "2026-07-13",
          unread: true,
        },
      ],
    }),
    searchMessages: vi.fn(),
    getMessage: vi.fn(),
    replyToMessage: vi.fn(),
  };
}

let originalToolCallingKillSwitch: string | undefined;
let originalGmailKillSwitch: string | undefined;

beforeEach(() => {
  originalToolCallingKillSwitch = process.env.SAMUEL_TOOL_CALLING_ENABLED;
  originalGmailKillSwitch = process.env.SAMUEL_GMAIL_TOOL_ENABLED;
  delete process.env.SAMUEL_TOOL_CALLING_ENABLED;
  delete process.env.SAMUEL_GMAIL_TOOL_ENABLED;
  fromMock.mockReset();
  getGmailClientForCompanyMock.mockReset();
  generateNarrativeViaAIGatewayMock.mockReset().mockResolvedValue(null);
});

afterEach(() => {
  if (originalToolCallingKillSwitch === undefined) delete process.env.SAMUEL_TOOL_CALLING_ENABLED;
  else process.env.SAMUEL_TOOL_CALLING_ENABLED = originalToolCallingKillSwitch;
  if (originalGmailKillSwitch === undefined) delete process.env.SAMUEL_GMAIL_TOOL_ENABLED;
  else process.env.SAMUEL_GMAIL_TOOL_ENABLED = originalGmailKillSwitch;
});

describe("runSamuelRuntime — Gmail Tool (Sprint 87)", () => {
  it("aciona gmail inbox_summary para 'Responda meus e-mails.' e inclui preview na narrativa", async () => {
    getGmailClientForCompanyMock.mockResolvedValue(createClientMock());

    const result = await runSamuelRuntime({
      query: "Responda meus e-mails.",
      companyId: VALID_COMPANY_ID,
      animate: false,
    });

    expect(result.tooling).toMatchObject({
      attempted: true,
      toolName: "gmail",
      status: "success",
    });
    expect(result.response.narrative).toContain("Inbox de empresa@gmail.com");
    expect(result.response.narrative).toContain("Proposta comercial");
  });

  it("aciona gmail search_messages para busca de e-mails", async () => {
    const client = createClientMock();
    client.searchMessages.mockResolvedValue([
      {
        id: "m2",
        threadId: "t2",
        subject: "Follow-up",
        from: "parceiro@empresa.com",
        snippet: "Retorno da reunião",
        date: "2026-07-13",
        unread: false,
      },
    ]);
    getGmailClientForCompanyMock.mockResolvedValue(client);

    const result = await runSamuelRuntime({
      query: "Pesquise e-mails de parceiro@empresa.com",
      companyId: VALID_COMPANY_ID,
      animate: false,
    });

    expect(result.tooling).toMatchObject({
      attempted: true,
      toolName: "gmail",
      status: "success",
    });
    expect(result.response.narrative).toContain("1 e-mail(s) encontrado(s)");
  });

  it("degrada com segurança quando companyId não é UUID", async () => {
    const result = await runSamuelRuntime({
      query: "Responda meus e-mails.",
      animate: false,
    });

    expect(result.tooling.attempted).toBe(true);
    expect(result.tooling.status).toBe("error");
    expect(result.tooling.error).toMatch(/companyId ausente ou inválido/);
    expect(result.response.narrative.length).toBeGreaterThan(0);
  });
});
