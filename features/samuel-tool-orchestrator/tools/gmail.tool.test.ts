import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

const { GmailTool } = await import("./gmail.tool");
const { ToolExecutionError } = await import("../tool-execution-error");

const VALID_COMPANY_ID = "11111111-1111-1111-1111-111111111111";

function baseContext(input: Record<string, unknown>, companyId: string | undefined = VALID_COMPANY_ID) {
  return {
    requestId: "req-1",
    organizationId: "org-1",
    companyId,
    input,
    requestedAt: new Date().toISOString(),
  };
}

function createClientMock(overrides: Record<string, unknown> = {}) {
  return {
    getInboxSummary: vi.fn().mockResolvedValue({
      emailAddress: "empresa@gmail.com",
      unreadCount: 2,
      messages: [
        {
          id: "m1",
          threadId: "t1",
          subject: "Proposta",
          from: "cliente@empresa.com",
          snippet: "Olá, segue proposta",
          date: "2026-07-13",
          unread: true,
        },
      ],
    }),
    searchMessages: vi.fn().mockResolvedValue([
      {
        id: "m2",
        threadId: "t2",
        subject: "Reunião",
        from: "parceiro@empresa.com",
        snippet: "Confirmar horário",
        date: "2026-07-13",
        unread: false,
      },
    ]),
    getMessage: vi.fn().mockResolvedValue({
      id: "m1",
      threadId: "t1",
      subject: "Proposta",
      from: "cliente@empresa.com",
      to: "empresa@gmail.com",
      snippet: "Olá, segue proposta",
      date: "2026-07-13",
      unread: true,
      body: "Corpo completo do e-mail.",
    }),
    replyToMessage: vi.fn().mockResolvedValue({ messageId: "sent-1", threadId: "t1" }),
    ...overrides,
  };
}

let originalKillSwitch: string | undefined;

beforeEach(() => {
  getGmailClientForCompanyMock.mockReset();
  originalKillSwitch = process.env.SAMUEL_GMAIL_TOOL_ENABLED;
  delete process.env.SAMUEL_GMAIL_TOOL_ENABLED;
});

afterEach(() => {
  if (originalKillSwitch === undefined) delete process.env.SAMUEL_GMAIL_TOOL_ENABLED;
  else process.env.SAMUEL_GMAIL_TOOL_ENABLED = originalKillSwitch;
});

describe("GmailTool", () => {
  const tool = new GmailTool();

  it("rejeita actionId desconhecido", async () => {
    await expect(tool.execute(baseContext({ actionId: "delete_all" }))).rejects.toBeInstanceOf(
      ToolExecutionError,
    );
  });

  it("rejeita quando companyId não é UUID", async () => {
    await expect(
      tool.execute(baseContext({ actionId: "inbox_summary" }, "default-company")),
    ).rejects.toThrow(/companyId ausente ou inválido/);
  });

  it("respeita kill-switch SAMUEL_GMAIL_TOOL_ENABLED=false", async () => {
    process.env.SAMUEL_GMAIL_TOOL_ENABLED = "false";
    await expect(tool.execute(baseContext({ actionId: "inbox_summary" }))).rejects.toThrow(
      /Gmail Tool está desabilitada/,
    );
  });

  it("executa inbox_summary com dados reais do client Gmail", async () => {
    const client = createClientMock();
    getGmailClientForCompanyMock.mockResolvedValue(client);

    const result = await tool.execute(baseContext({ actionId: "inbox_summary" }));

    expect(getGmailClientForCompanyMock).toHaveBeenCalledWith(VALID_COMPANY_ID);
    expect(client.getInboxSummary).toHaveBeenCalled();
    expect(result.actionId).toBe("inbox_summary");
    expect(result.summary).toContain("empresa@gmail.com");
    expect(result.data.unreadCount).toBe(2);
  });

  it("executa search_messages com query informada", async () => {
    const client = createClientMock();
    getGmailClientForCompanyMock.mockResolvedValue(client);

    const result = await tool.execute(
      baseContext({ actionId: "search_messages", query: "from:parceiro@empresa.com" }),
    );

    expect(client.searchMessages).toHaveBeenCalledWith("from:parceiro@empresa.com", 10);
    expect(result.summary).toContain("1 e-mail(s) encontrado(s)");
  });

  it("executa read_message com messageId explícito", async () => {
    const client = createClientMock();
    getGmailClientForCompanyMock.mockResolvedValue(client);

    const result = await tool.execute(baseContext({ actionId: "read_message", messageId: "m1" }));

    expect(client.getMessage).toHaveBeenCalledWith("m1");
    expect(result.data.message).toMatchObject({ id: "m1", body: "Corpo completo do e-mail." });
  });

  it("executa reply_message e envia resposta real", async () => {
    const client = createClientMock();
    getGmailClientForCompanyMock.mockResolvedValue(client);

    const result = await tool.execute(
      baseContext({
        actionId: "reply_message",
        messageId: "m1",
        body: "Obrigado, recebemos sua proposta.",
      }),
    );

    expect(client.replyToMessage).toHaveBeenCalledWith({
      messageId: "m1",
      body: "Obrigado, recebemos sua proposta.",
    });
    expect(result.summary).toContain("Resposta enviada com sucesso");
  });

  it("propaga erro do Gmail como ToolExecutionError", async () => {
    getGmailClientForCompanyMock.mockRejectedValue(new Error("NOT_CONNECTED"));

    await expect(tool.execute(baseContext({ actionId: "inbox_summary" }))).rejects.toThrow(
      /NOT_CONNECTED/,
    );
  });
});
