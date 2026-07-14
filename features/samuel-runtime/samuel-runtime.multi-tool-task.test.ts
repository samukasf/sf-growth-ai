import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fromMock = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  supabase: { from: fromMock },
}));

const getGoogleContactsProviderForCompanyMock = vi.fn();
vi.mock("@/features/google-contacts/google-contacts.provider", () => ({
  getGoogleContactsProviderForCompany: getGoogleContactsProviderForCompanyMock,
  formatContactLine: (contact: { name: string; emails?: string[] }) =>
    contact.emails?.[0] ? `${contact.name}: ${contact.emails[0]}` : contact.name,
}));

const getGoogleCalendarProviderForCompanyMock = vi.fn();
vi.mock("@/features/google-calendar/google-calendar.provider", () => ({
  getGoogleCalendarProviderForCompany: getGoogleCalendarProviderForCompanyMock,
  formatEventLine: (event: { startLabel: string; title: string }) => `${event.startLabel} — ${event.title}`,
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
const MEETING_QUERY =
  "Marque uma reunião com João na sexta às 14h e envie o convite por e-mail.";

function createContactsProviderMock() {
  return {
    searchContacts: vi.fn(),
    findContactByName: vi.fn().mockResolvedValue({
      resourceName: "people/joao",
      name: "João Silva",
      emails: ["joao@empresa.com"],
      phones: [],
      company: "Acme Labs",
    }),
    findByCompany: vi.fn(),
    getBirthdaysThisMonth: vi.fn(),
    toContactSummary: vi.fn(() => ({
      id: "people/joao",
      name: "João Silva",
      emails: ["joao@empresa.com"],
      phones: [],
      company: "Acme Labs",
    })),
  };
}

function createCalendarProviderMock() {
  return {
    getTodayEvents: vi.fn().mockResolvedValue([
      {
        id: "evt-1",
        summary: "Reunião Comercial",
        start: { dateTime: "2026-07-13T09:00:00.000Z" },
        end: { dateTime: "2026-07-13T10:00:00.000Z" },
      },
    ]),
    getWeekEvents: vi.fn(),
    searchEvents: vi.fn(),
    listEvents: vi.fn(),
    getAvailability: vi.fn(),
    createEvent: vi.fn().mockResolvedValue({
      id: "evt-new",
      summary: "Reunião com João Silva",
      start: { dateTime: "2026-07-17T14:00:00.000Z" },
      end: { dateTime: "2026-07-17T15:00:00.000Z" },
    }),
    updateEvent: vi.fn(),
    deleteEvent: vi.fn(),
    toEventSummary: vi.fn(() => ({
      id: "evt-new",
      title: "Reunião com João Silva",
      start: "2026-07-17T14:00:00.000Z",
      end: "2026-07-17T15:00:00.000Z",
      startLabel: "14:00",
      endLabel: "15:00",
    })),
  };
}

function createGmailClientMock() {
  const message = {
    id: "m1",
    threadId: "t1",
    subject: "Reunião",
    from: "eu@empresa.com",
    snippet: "",
    date: "2026-07-13",
    unread: false,
  };

  return {
    getInboxSummary: vi.fn(),
    searchMessages: vi.fn().mockResolvedValue([message]),
    getMessage: vi.fn().mockResolvedValue(message),
    replyToMessage: vi.fn().mockResolvedValue({
      messageId: "sent-1",
      threadId: "t1",
    }),
  };
}

let originalToolCallingKillSwitch: string | undefined;
let originalMultiToolKillSwitch: string | undefined;
let originalContactsKillSwitch: string | undefined;
let originalCalendarKillSwitch: string | undefined;
let originalGmailKillSwitch: string | undefined;
let originalInterpreterKillSwitch: string | undefined;
let originalConversationMemoryKillSwitch: string | undefined;

beforeEach(() => {
  originalToolCallingKillSwitch = process.env.SAMUEL_TOOL_CALLING_ENABLED;
  originalMultiToolKillSwitch = process.env.SAMUEL_MULTI_TOOL_TASK_ORCHESTRATOR_ENABLED;
  originalContactsKillSwitch = process.env.SAMUEL_GOOGLE_CONTACTS_TOOL_ENABLED;
  originalCalendarKillSwitch = process.env.SAMUEL_GOOGLE_CALENDAR_TOOL_ENABLED;
  originalGmailKillSwitch = process.env.SAMUEL_GMAIL_TOOL_ENABLED;
  originalInterpreterKillSwitch = process.env.SAMUEL_TOOL_INTERPRETER_ENABLED;
  originalConversationMemoryKillSwitch = process.env.SAMUEL_CONVERSATION_MEMORY_ENABLED;

  delete process.env.SAMUEL_TOOL_CALLING_ENABLED;
  delete process.env.SAMUEL_MULTI_TOOL_TASK_ORCHESTRATOR_ENABLED;
  delete process.env.SAMUEL_GOOGLE_CONTACTS_TOOL_ENABLED;
  delete process.env.SAMUEL_GOOGLE_CALENDAR_TOOL_ENABLED;
  delete process.env.SAMUEL_GMAIL_TOOL_ENABLED;
  delete process.env.SAMUEL_TOOL_INTERPRETER_ENABLED;
  process.env.SAMUEL_CONVERSATION_MEMORY_ENABLED = "false";

  fromMock.mockReset();
  getGoogleContactsProviderForCompanyMock.mockReset();
  getGoogleCalendarProviderForCompanyMock.mockReset();
  getGmailClientForCompanyMock.mockReset();

  getGoogleContactsProviderForCompanyMock.mockResolvedValue(createContactsProviderMock());
  getGoogleCalendarProviderForCompanyMock.mockResolvedValue(createCalendarProviderMock());
  getGmailClientForCompanyMock.mockResolvedValue(createGmailClientMock());

  generateNarrativeViaAIGatewayMock.mockReset().mockResolvedValue({
    narrative: "Reunião agendada com João e convite enviado por e-mail.",
    metadata: { used: true },
  });
});

afterEach(() => {
  const restore = (key: string, value: string | undefined) => {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  };
  restore("SAMUEL_TOOL_CALLING_ENABLED", originalToolCallingKillSwitch);
  restore("SAMUEL_MULTI_TOOL_TASK_ORCHESTRATOR_ENABLED", originalMultiToolKillSwitch);
  restore("SAMUEL_GOOGLE_CONTACTS_TOOL_ENABLED", originalContactsKillSwitch);
  restore("SAMUEL_GOOGLE_CALENDAR_TOOL_ENABLED", originalCalendarKillSwitch);
  restore("SAMUEL_GMAIL_TOOL_ENABLED", originalGmailKillSwitch);
  restore("SAMUEL_TOOL_INTERPRETER_ENABLED", originalInterpreterKillSwitch);
  restore("SAMUEL_CONVERSATION_MEMORY_ENABLED", originalConversationMemoryKillSwitch);
});

describe("runSamuelRuntime — Multi-Tool Task Orchestrator (Sprint 90)", () => {
  it("executa contacts → calendar → gmail e expõe sequência no multiToolTask", async () => {
    const result = await runSamuelRuntime({
      query: MEETING_QUERY,
      companyId: VALID_COMPANY_ID,
      animate: false,
    });

    expect(result.multiToolTask).toMatchObject({
      enabled: true,
      attempted: true,
      overallStatus: "success",
    });
    expect(result.multiToolTask.steps).toHaveLength(3);
    expect(result.multiToolTask.steps?.map((step) => step.toolName)).toEqual([
      "google-contacts",
      "google-calendar",
      "gmail",
    ]);
    expect(result.tooling.attempted).toBe(false);
    expect(generateNarrativeViaAIGatewayMock).toHaveBeenCalledWith(
      expect.objectContaining({
        conversationContext: expect.stringContaining("multi-ferramenta"),
      }),
    );
  });

  it("cai no Tool Planner de ferramenta única quando kill-switch está desligado", async () => {
    process.env.SAMUEL_MULTI_TOOL_TASK_ORCHESTRATOR_ENABLED = "false";

    const result = await runSamuelRuntime({
      query: "O que tenho hoje?",
      companyId: VALID_COMPANY_ID,
      animate: false,
    });

    expect(result.multiToolTask.attempted).toBe(false);
    expect(result.tooling).toMatchObject({
      attempted: true,
      toolName: "google-calendar",
      status: "success",
    });
  });

  it("preserva etapas bem-sucedidas quando contatos falham e gmail é ignorado", async () => {
    getGoogleContactsProviderForCompanyMock.mockRejectedValue(new Error("Token OAuth expirado"));

    const result = await runSamuelRuntime({
      query: MEETING_QUERY,
      companyId: VALID_COMPANY_ID,
      animate: false,
    });

    expect(result.multiToolTask.overallStatus).toBe("partial");
    expect(result.multiToolTask.steps?.[0].status).toBe("error");
    expect(result.multiToolTask.steps?.[1].status).toBe("success");
    expect(result.multiToolTask.steps?.[2].status).toBe("skipped");
  });
});
