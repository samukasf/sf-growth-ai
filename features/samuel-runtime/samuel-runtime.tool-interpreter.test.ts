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
      unreadCount: 201,
      messages: [
        {
          id: "m1",
          threadId: "t1",
          subject: "Pintura Geral em Sintra",
          from: "zaask@mail.com",
          snippet: "Oportunidade de pintura",
          date: "2026-07-13",
          unread: true,
        },
        {
          id: "m2",
          threadId: "t2",
          subject: "Alerta Google Empregos",
          from: "jobs@google.com",
          snippet: "Novas vagas",
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
let originalInterpreterKillSwitch: string | undefined;
let originalConversationMemoryKillSwitch: string | undefined;

beforeEach(() => {
  originalToolCallingKillSwitch = process.env.SAMUEL_TOOL_CALLING_ENABLED;
  originalGmailKillSwitch = process.env.SAMUEL_GMAIL_TOOL_ENABLED;
  originalInterpreterKillSwitch = process.env.SAMUEL_TOOL_INTERPRETER_ENABLED;
  originalConversationMemoryKillSwitch = process.env.SAMUEL_CONVERSATION_MEMORY_ENABLED;
  delete process.env.SAMUEL_TOOL_CALLING_ENABLED;
  delete process.env.SAMUEL_GMAIL_TOOL_ENABLED;
  delete process.env.SAMUEL_TOOL_INTERPRETER_ENABLED;
  fromMock.mockReset();
  getGmailClientForCompanyMock.mockReset();
  generateNarrativeViaAIGatewayMock.mockReset().mockResolvedValue(null);
  process.env.SAMUEL_CONVERSATION_MEMORY_ENABLED = "false";
});

afterEach(() => {
  if (originalToolCallingKillSwitch === undefined) delete process.env.SAMUEL_TOOL_CALLING_ENABLED;
  else process.env.SAMUEL_TOOL_CALLING_ENABLED = originalToolCallingKillSwitch;
  if (originalGmailKillSwitch === undefined) delete process.env.SAMUEL_GMAIL_TOOL_ENABLED;
  else process.env.SAMUEL_GMAIL_TOOL_ENABLED = originalGmailKillSwitch;
  if (originalInterpreterKillSwitch === undefined) delete process.env.SAMUEL_TOOL_INTERPRETER_ENABLED;
  else process.env.SAMUEL_TOOL_INTERPRETER_ENABLED = originalInterpreterKillSwitch;
  if (originalConversationMemoryKillSwitch === undefined) delete process.env.SAMUEL_CONVERSATION_MEMORY_ENABLED;
  else process.env.SAMUEL_CONVERSATION_MEMORY_ENABLED = originalConversationMemoryKillSwitch;
});

describe("runSamuelRuntime — Tool Result Interpreter (Sprint 87)", () => {
  it("interpreta Gmail inbox e envia contexto ao AI Gateway sem JSON na narrativa", async () => {
    getGmailClientForCompanyMock.mockResolvedValue(createClientMock());
    generateNarrativeViaAIGatewayMock.mockResolvedValue({
      narrative:
        "Encontrei 201 mensagens não lidas. As mais recentes são oportunidades da Zaask para pintura e alertas de emprego.",
      metadata: { used: true, providerId: "openai", providerType: "openai", model: "gpt-4o-mini" },
    });

    const result = await runSamuelRuntime({
      query: "Resuma minha caixa de entrada.",
      companyId: VALID_COMPANY_ID,
      animate: false,
    });

    expect(generateNarrativeViaAIGatewayMock).toHaveBeenCalledWith(
      expect.objectContaining({
        conversationContext: expect.stringContaining("A Gmail Tool retornou:"),
      }),
    );
    expect(generateNarrativeViaAIGatewayMock.mock.calls[0][0].conversationContext).toContain(
      "201 mensagem(ns) não lida(s)",
    );
    expect(generateNarrativeViaAIGatewayMock.mock.calls[0][0].conversationContext).toContain(
      "• Pintura Geral em Sintra",
    );

    expect(result.response.narrative).not.toContain('"actionId"');
    expect(result.response.narrative).toContain("201 mensagens não lidas");
  });

  it("usa humanFallback legível quando o AI Gateway não responde", async () => {
    getGmailClientForCompanyMock.mockResolvedValue(createClientMock());

    const result = await runSamuelRuntime({
      query: "Resuma minha caixa de entrada.",
      companyId: VALID_COMPANY_ID,
      animate: false,
    });

    expect(result.response.narrative).toContain("Inbox de empresa@gmail.com");
    expect(result.response.narrative).toContain("Pintura Geral em Sintra");
    expect(result.response.narrative).not.toContain('"messages"');
  });

  it("mantém comportamento legado com prefixo determinístico quando interpreter desligado", async () => {
    process.env.SAMUEL_TOOL_INTERPRETER_ENABLED = "false";
    getGmailClientForCompanyMock.mockResolvedValue(createClientMock());

    const result = await runSamuelRuntime({
      query: "Resuma minha caixa de entrada.",
      companyId: VALID_COMPANY_ID,
      animate: false,
    });

    const gatewayCall = generateNarrativeViaAIGatewayMock.mock.calls[0][0];
    expect(gatewayCall.conversationContext ?? "").not.toContain("A Gmail Tool retornou:");
    expect(result.response.narrative).toContain("📧");
    expect(result.response.narrative).toContain("Inbox de empresa@gmail.com");
  });
});
