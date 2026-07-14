import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getGoogleCalendarProviderForCompanyMock = vi.fn();

vi.mock("./google-calendar.provider", async (importOriginal) => {
  const original = await importOriginal<typeof import("./google-calendar.provider")>();
  return {
    ...original,
    getGoogleCalendarProviderForCompany: getGoogleCalendarProviderForCompanyMock,
  };
});

const { CalendarTool } = await import("./calendar-tool");

function createProviderMock() {
  const events = [
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
  ];

  return {
    getTodayEvents: vi.fn().mockResolvedValue(events),
    getWeekEvents: vi.fn().mockResolvedValue(events),
    searchEvents: vi.fn().mockResolvedValue(events.slice(0, 1)),
    listEvents: vi.fn().mockResolvedValue(events),
    getAvailability: vi.fn().mockResolvedValue({
      busyCount: 2,
      freeSlots: [{ start: "2026-07-13T10:30:00.000Z", end: "2026-07-13T13:45:00.000Z", startLabel: "10:30", endLabel: "13:45" }],
    }),
    createEvent: vi.fn().mockResolvedValue({
      id: "evt-new",
      summary: "Reunião Nova",
      start: { dateTime: "2026-07-17T10:00:00.000Z" },
      end: { dateTime: "2026-07-17T11:00:00.000Z" },
    }),
    updateEvent: vi.fn().mockResolvedValue({
      id: "evt-1",
      summary: "Reunião Atualizada",
      start: { dateTime: "2026-07-13T09:00:00.000Z" },
      end: { dateTime: "2026-07-13T10:00:00.000Z" },
    }),
    deleteEvent: vi.fn().mockResolvedValue(undefined),
    toEventSummary: vi.fn((event: { id: string; summary: string; start: { dateTime?: string }; end: { dateTime?: string } }) => ({
      id: event.id,
      title: event.summary,
      start: event.start.dateTime ?? "",
      end: event.end.dateTime ?? "",
      startLabel: "09:00",
      endLabel: "10:00",
    })),
  };
}

const VALID_COMPANY_ID = "dc8a6425-e184-4730-9b9d-df4e999e5b61";

let originalKillSwitch: string | undefined;

beforeEach(() => {
  originalKillSwitch = process.env.SAMUEL_GOOGLE_CALENDAR_TOOL_ENABLED;
  delete process.env.SAMUEL_GOOGLE_CALENDAR_TOOL_ENABLED;
  getGoogleCalendarProviderForCompanyMock.mockReset();
  getGoogleCalendarProviderForCompanyMock.mockResolvedValue(createProviderMock());
});

afterEach(() => {
  if (originalKillSwitch === undefined) delete process.env.SAMUEL_GOOGLE_CALENDAR_TOOL_ENABLED;
  else process.env.SAMUEL_GOOGLE_CALENDAR_TOOL_ENABLED = originalKillSwitch;
});

describe("CalendarTool", () => {
  const tool = new CalendarTool();

  it("lista agenda de hoje via calendar_today", async () => {
    const result = await tool.execute({
      organizationId: "org",
      companyId: VALID_COMPANY_ID,
      input: { actionId: "calendar_today" },
    });

    expect(result.actionId).toBe("calendar_today");
    expect(result.summary).toContain("2 compromisso(s)");
    expect(result.data.eventCount).toBe(2);
    expect(result.data.preview).toContain("Reunião Comercial");
  });

  it("lista agenda da semana via calendar_week", async () => {
    const result = await tool.execute({
      organizationId: "org",
      companyId: VALID_COMPANY_ID,
      input: { actionId: "calendar_week" },
    });

    expect(result.summary).toContain("nesta semana");
    expect(result.data.eventCount).toBe(2);
  });

  it("busca eventos via calendar_search", async () => {
    const result = await tool.execute({
      organizationId: "org",
      companyId: VALID_COMPANY_ID,
      input: { actionId: "calendar_search", query: "comercial" },
    });

    expect(result.summary).toContain('para "comercial"');
    expect(result.data.eventCount).toBe(1);
  });

  it("retorna disponibilidade via calendar_availability", async () => {
    const result = await tool.execute({
      organizationId: "org",
      companyId: VALID_COMPANY_ID,
      input: { actionId: "calendar_availability" },
    });

    expect(result.summary).toContain("janela(s) livre(s)");
    expect(result.data.preview).toContain("10:30");
  });

  it("cria evento via calendar_create", async () => {
    const result = await tool.execute({
      organizationId: "org",
      companyId: VALID_COMPANY_ID,
      input: {
        actionId: "calendar_create",
        title: "Reunião Nova",
        start: "2026-07-17T10:00:00.000Z",
        end: "2026-07-17T11:00:00.000Z",
      },
    });

    expect(result.summary).toContain("criado");
    expect(result.data.eventCount).toBe(1);
  });

  it("exclui evento via calendar_delete", async () => {
    const result = await tool.execute({
      organizationId: "org",
      companyId: VALID_COMPANY_ID,
      input: { actionId: "calendar_delete", eventId: "evt-1" },
    });

    expect(result.summary).toContain("excluído");
  });

  it("rejeita companyId inválido", async () => {
    await expect(
      tool.execute({
        organizationId: "org",
        companyId: "invalid",
        input: { actionId: "calendar_today" },
      }),
    ).rejects.toThrow(/companyId ausente ou inválido/);
  });

  it("respeita kill-switch SAMUEL_GOOGLE_CALENDAR_TOOL_ENABLED=false", async () => {
    process.env.SAMUEL_GOOGLE_CALENDAR_TOOL_ENABLED = "false";

    await expect(
      tool.execute({
        organizationId: "org",
        companyId: VALID_COMPANY_ID,
        input: { actionId: "calendar_today" },
      }),
    ).rejects.toThrow(/desabilitada/);
  });
});
