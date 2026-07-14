import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fromMock = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  supabase: { from: fromMock },
}));

const getGoogleCalendarProviderForCompanyMock = vi.fn();
vi.mock("@/features/google-calendar/google-calendar.provider", () => ({
  getGoogleCalendarProviderForCompany: getGoogleCalendarProviderForCompanyMock,
  formatEventLine: (event: { startLabel: string; title: string }) => `${event.startLabel} — ${event.title}`,
}));

const generateNarrativeViaAIGatewayMock = vi.fn();
vi.mock("./ai-gateway-narrative.adapter", () => ({
  generateNarrativeViaAIGateway: generateNarrativeViaAIGatewayMock,
}));

const { runSamuelRuntime } = await import("./samuel-runtime.service");

const VALID_COMPANY_ID = "dc8a6425-e184-4730-9b9d-df4e999e5b61";

function createProviderMock() {
  return {
    getTodayEvents: vi.fn().mockResolvedValue([
      {
        id: "evt-1",
        summary: "Reunião Comercial",
        start: { dateTime: "2026-07-13T09:00:00.000Z" },
        end: { dateTime: "2026-07-13T10:00:00.000Z" },
      },
      {
        id: "evt-2",
        summary: "Visita ao Cliente",
        start: { dateTime: "2026-07-13T14:00:00.000Z" },
        end: { dateTime: "2026-07-13T15:00:00.000Z" },
      },
      {
        id: "evt-3",
        summary: "Academia",
        start: { dateTime: "2026-07-13T18:30:00.000Z" },
        end: { dateTime: "2026-07-13T19:30:00.000Z" },
      },
    ]),
    getWeekEvents: vi.fn(),
    searchEvents: vi.fn(),
    listEvents: vi.fn(),
    getAvailability: vi.fn().mockResolvedValue({
      busyCount: 3,
      freeSlots: [{ start: "", end: "", startLabel: "10:30", endLabel: "13:45" }],
    }),
    createEvent: vi.fn(),
    updateEvent: vi.fn(),
    deleteEvent: vi.fn(),
    toEventSummary: vi.fn((event: { id: string; summary: string; start: { dateTime?: string }; end: { dateTime?: string } }) => ({
      id: event.id,
      title: event.summary,
      start: event.start.dateTime ?? "",
      end: event.end.dateTime ?? "",
      startLabel:
        event.summary === "Reunião Comercial"
          ? "09:00"
          : event.summary === "Visita ao Cliente"
            ? "14:00"
            : "18:30",
      endLabel: "10:00",
    })),
  };
}

let originalToolCallingKillSwitch: string | undefined;
let originalCalendarKillSwitch: string | undefined;
let originalInterpreterKillSwitch: string | undefined;
let originalConversationMemoryKillSwitch: string | undefined;

beforeEach(() => {
  originalToolCallingKillSwitch = process.env.SAMUEL_TOOL_CALLING_ENABLED;
  originalCalendarKillSwitch = process.env.SAMUEL_GOOGLE_CALENDAR_TOOL_ENABLED;
  originalInterpreterKillSwitch = process.env.SAMUEL_TOOL_INTERPRETER_ENABLED;
  originalConversationMemoryKillSwitch = process.env.SAMUEL_CONVERSATION_MEMORY_ENABLED;
  delete process.env.SAMUEL_TOOL_CALLING_ENABLED;
  delete process.env.SAMUEL_GOOGLE_CALENDAR_TOOL_ENABLED;
  delete process.env.SAMUEL_TOOL_INTERPRETER_ENABLED;
  process.env.SAMUEL_CONVERSATION_MEMORY_ENABLED = "false";
  fromMock.mockReset();
  getGoogleCalendarProviderForCompanyMock.mockReset();
  getGoogleCalendarProviderForCompanyMock.mockResolvedValue(createProviderMock());
  generateNarrativeViaAIGatewayMock.mockReset().mockResolvedValue({
    narrative:
      "Hoje você possui três compromissos: Reunião Comercial às 09:00, Visita ao Cliente às 14:00 e Academia às 18:30. Você está livre entre 10:30 e 13:45.",
    metadata: { used: true },
  });
});

afterEach(() => {
  if (originalToolCallingKillSwitch === undefined) delete process.env.SAMUEL_TOOL_CALLING_ENABLED;
  else process.env.SAMUEL_TOOL_CALLING_ENABLED = originalToolCallingKillSwitch;
  if (originalCalendarKillSwitch === undefined) delete process.env.SAMUEL_GOOGLE_CALENDAR_TOOL_ENABLED;
  else process.env.SAMUEL_GOOGLE_CALENDAR_TOOL_ENABLED = originalCalendarKillSwitch;
  if (originalInterpreterKillSwitch === undefined) delete process.env.SAMUEL_TOOL_INTERPRETER_ENABLED;
  else process.env.SAMUEL_TOOL_INTERPRETER_ENABLED = originalInterpreterKillSwitch;
  if (originalConversationMemoryKillSwitch === undefined) delete process.env.SAMUEL_CONVERSATION_MEMORY_ENABLED;
  else process.env.SAMUEL_CONVERSATION_MEMORY_ENABLED = originalConversationMemoryKillSwitch;
});

describe("runSamuelRuntime — Google Calendar Tool (Sprint 88)", () => {
  it("aciona google-calendar para 'O que tenho hoje?' e interpreta sem JSON", async () => {
    const result = await runSamuelRuntime({
      query: "O que tenho hoje?",
      companyId: VALID_COMPANY_ID,
      animate: false,
    });

    expect(result.tooling).toMatchObject({
      attempted: true,
      toolName: "google-calendar",
      status: "success",
    });
    expect(result.tooling.input).toMatchObject({ actionId: "calendar_today" });
    expect(generateNarrativeViaAIGatewayMock).toHaveBeenCalledWith(
      expect.objectContaining({
        conversationContext: expect.stringContaining("Google Calendar Tool"),
      }),
    );
    expect(result.response.narrative).not.toContain('"eventCount"');
    expect(result.response.narrative).toContain("três compromissos");
  });

  it("usa humanFallback legível quando o AI Gateway não responde", async () => {
    generateNarrativeViaAIGatewayMock.mockResolvedValue(null);

    const result = await runSamuelRuntime({
      query: "O que tenho hoje?",
      companyId: VALID_COMPANY_ID,
      animate: false,
    });

    expect(result.response.narrative).toContain("3 compromisso(s)");
    expect(result.response.narrative).toContain("Reunião Comercial");
    expect(result.response.narrative).not.toContain('"events"');
  });
});
