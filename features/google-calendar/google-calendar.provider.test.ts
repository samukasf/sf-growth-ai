import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GoogleCalendarProvider } from "./google-calendar.provider";

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("GoogleCalendarProvider — chamadas reais à API", () => {
  const provider = new GoogleCalendarProvider("test-access-token");

  it("consulta eventos de hoje via Google Calendar API v3", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        items: [
          {
            id: "evt-1",
            summary: "Reunião Comercial",
            start: { dateTime: "2026-07-13T09:00:00+01:00" },
            end: { dateTime: "2026-07-13T10:00:00+01:00" },
          },
        ],
      }),
    });

    const events = await provider.getTodayEvents();

    expect(events).toHaveLength(1);
    expect(events[0].summary).toBe("Reunião Comercial");
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("https://www.googleapis.com/calendar/v3/calendars/primary/events"),
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer test-access-token",
        }),
      }),
    );
    expect(fetchMock.mock.calls[0][0]).toContain("singleEvents=true");
    expect(fetchMock.mock.calls[0][0]).toContain("orderBy=startTime");
  });

  it("cria evento via POST na Google Calendar API", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        id: "evt-new",
        summary: "Reunião Nova",
        start: { dateTime: "2026-07-17T10:00:00+01:00" },
        end: { dateTime: "2026-07-17T11:00:00+01:00" },
      }),
    });

    const created = await provider.createEvent({
      title: "Reunião Nova",
      start: "2026-07-17T10:00:00+01:00",
      end: "2026-07-17T11:00:00+01:00",
    });

    expect(created.id).toBe("evt-new");
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/calendars/primary/events"),
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("Reunião Nova"),
      }),
    );
  });
});
