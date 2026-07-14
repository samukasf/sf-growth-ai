import { resolveGmailAccessToken } from "@/integrations/gmail";

import type { CalendarProvider } from "./calendar-provider";
import {
  CalendarApiError,
  type CalendarAvailabilityResult,
  type CalendarEvent,
  type CalendarEventSummary,
  type CalendarFreeSlot,
  type CreateCalendarEventInput,
  type ListCalendarEventsOptions,
  type UpdateCalendarEventInput,
} from "./types";

const CALENDAR_API_BASE = "https://www.googleapis.com/calendar/v3";
const DEFAULT_CALENDAR_ID = "primary";
const DEFAULT_MAX_RESULTS = 25;
const WORKDAY_START_HOUR = 9;
const WORKDAY_END_HOUR = 18;

type GoogleCalendarEvent = {
  id?: string;
  summary?: string;
  description?: string;
  location?: string;
  htmlLink?: string;
  start?: { dateTime?: string; date?: string; timeZone?: string };
  end?: { dateTime?: string; date?: string; timeZone?: string };
};

type GoogleEventsListResponse = {
  items?: GoogleCalendarEvent[];
};

type GoogleFreeBusyResponse = {
  calendars?: Record<string, { busy?: Array<{ start: string; end: string }> }>;
};

function mapHttpError(status: number, body: string): never {
  if (status === 401) {
    throw new CalendarApiError(
      "AUTH_ERROR",
      "Token de acesso do Google expirado ou inválido — pode ser necessário reconectar a conta.",
      { status },
    );
  }
  if (status === 403) {
    throw new CalendarApiError(
      "AUTH_ERROR",
      "Permissões insuficientes para Google Calendar (verifique os scopes concedidos no OAuth).",
      { status },
    );
  }
  throw new CalendarApiError("UNKNOWN", `Erro na Google Calendar API (status ${status}): ${body}`, {
    status,
  });
}

function startOfDay(date = new Date(), dayOffset = 0): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date = new Date(), dayOffset = 0): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(23, 59, 59, 999);
  return d;
}

function startOfWeek(date = new Date()): Date {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function endOfWeek(date = new Date()): Date {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

function formatTimeLabel(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function formatDateLabel(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
}

function eventStartIso(event: GoogleCalendarEvent): string {
  return event.start?.dateTime ?? `${event.start?.date}T00:00:00`;
}

function eventEndIso(event: GoogleCalendarEvent): string {
  return event.end?.dateTime ?? `${event.end?.date}T23:59:59`;
}

function toCalendarEvent(event: GoogleCalendarEvent): CalendarEvent {
  if (!event.id) {
    throw new CalendarApiError("UNKNOWN", "Evento retornado pela API sem id.");
  }

  return {
    id: event.id,
    summary: event.summary ?? "(sem título)",
    description: event.description,
    location: event.location,
    start: event.start ?? {},
    end: event.end ?? {},
    htmlLink: event.htmlLink,
  };
}

function computeFreeSlots(
  events: CalendarEventSummary[],
  timeMin: string,
  timeMax: string,
): CalendarFreeSlot[] {
  const dayStart = new Date(timeMin);
  dayStart.setHours(WORKDAY_START_HOUR, 0, 0, 0);
  const dayEnd = new Date(timeMin);
  dayEnd.setHours(WORKDAY_END_HOUR, 0, 0, 0);

  const busy = events
    .map((event) => ({
      start: new Date(event.start).getTime(),
      end: new Date(event.end).getTime(),
    }))
    .filter((slot) => !Number.isNaN(slot.start) && !Number.isNaN(slot.end))
    .sort((a, b) => a.start - b.start);

  const freeSlots: CalendarFreeSlot[] = [];
  let cursor = dayStart.getTime();

  for (const slot of busy) {
    if (slot.start > cursor) {
      const start = new Date(cursor).toISOString();
      const end = new Date(slot.start).toISOString();
      freeSlots.push({
        start,
        end,
        startLabel: formatTimeLabel(start),
        endLabel: formatTimeLabel(end),
      });
    }
    cursor = Math.max(cursor, slot.end);
  }

  if (cursor < dayEnd.getTime()) {
    const start = new Date(cursor).toISOString();
    const end = dayEnd.toISOString();
    freeSlots.push({
      start,
      end,
      startLabel: formatTimeLabel(start),
      endLabel: formatTimeLabel(end),
    });
  }

  return freeSlots;
}

export class GoogleCalendarProvider implements CalendarProvider {
  constructor(private readonly accessToken: string) {}

  private async request<T>(
    path: string,
    init?: { method?: string; body?: unknown; query?: Record<string, string | number | undefined> },
  ): Promise<T> {
    const url = new URL(`${CALENDAR_API_BASE}${path}`);
    if (init?.query) {
      for (const [key, value] of Object.entries(init.query)) {
        if (value !== undefined) url.searchParams.set(key, String(value));
      }
    }

    let response: Response;
    try {
      response = await fetch(url.toString(), {
        method: init?.method ?? "GET",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          Accept: "application/json",
          ...(init?.body ? { "Content-Type": "application/json" } : {}),
        },
        body: init?.body ? JSON.stringify(init.body) : undefined,
        cache: "no-store",
      });
    } catch (error) {
      throw new CalendarApiError("NETWORK_ERROR", "Falha de rede ao consultar a Google Calendar API.", {
        cause: error,
      });
    }

    if (!response.ok) {
      mapHttpError(response.status, await response.text());
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  toEventSummary(event: CalendarEvent): CalendarEventSummary {
    const start = event.start.dateTime ?? `${event.start.date}T00:00:00`;
    const end = event.end.dateTime ?? `${event.end.date}T23:59:59`;
    return {
      id: event.id,
      title: event.summary,
      start,
      end,
      startLabel: event.start.dateTime ? formatTimeLabel(start) : formatDateLabel(start),
      endLabel: event.end.dateTime ? formatTimeLabel(end) : formatDateLabel(end),
      location: event.location,
    };
  }

  async listEvents(options: ListCalendarEventsOptions): Promise<CalendarEvent[]> {
    const response = await this.request<GoogleEventsListResponse>(
      `/calendars/${encodeURIComponent(DEFAULT_CALENDAR_ID)}/events`,
      {
        query: {
          timeMin: options.timeMin,
          timeMax: options.timeMax,
          q: options.query,
          maxResults: options.maxResults ?? DEFAULT_MAX_RESULTS,
          singleEvents: "true",
          orderBy: "startTime",
        },
      },
    );

    return (response.items ?? []).map(toCalendarEvent);
  }

  async getTodayEvents(dayOffset = 0): Promise<CalendarEvent[]> {
    return this.listEvents({
      timeMin: startOfDay(new Date(), dayOffset).toISOString(),
      timeMax: endOfDay(new Date(), dayOffset).toISOString(),
    });
  }

  async getWeekEvents(): Promise<CalendarEvent[]> {
    return this.listEvents({
      timeMin: startOfWeek().toISOString(),
      timeMax: endOfWeek().toISOString(),
    });
  }

  async searchEvents(query: string, maxResults = DEFAULT_MAX_RESULTS): Promise<CalendarEvent[]> {
    const now = new Date();
    const horizon = new Date(now);
    horizon.setDate(horizon.getDate() + 90);

    return this.listEvents({
      timeMin: now.toISOString(),
      timeMax: horizon.toISOString(),
      query,
      maxResults,
    });
  }

  async getAvailability(timeMin: string, timeMax: string): Promise<CalendarAvailabilityResult> {
    const events = await this.listEvents({ timeMin, timeMax });
    const summaries = events.map((event) => this.toEventSummary(event));
    return {
      busyCount: summaries.length,
      freeSlots: computeFreeSlots(summaries, timeMin, timeMax),
    };
  }

  async createEvent(input: CreateCalendarEventInput): Promise<CalendarEvent> {
    const created = await this.request<GoogleCalendarEvent>(
      `/calendars/${encodeURIComponent(DEFAULT_CALENDAR_ID)}/events`,
      {
        method: "POST",
        body: {
          summary: input.title,
          description: input.description,
          location: input.location,
          start: { dateTime: input.start },
          end: { dateTime: input.end },
        },
      },
    );

    return toCalendarEvent(created);
  }

  async updateEvent(input: UpdateCalendarEventInput): Promise<CalendarEvent> {
    const updated = await this.request<GoogleCalendarEvent>(
      `/calendars/${encodeURIComponent(DEFAULT_CALENDAR_ID)}/events/${encodeURIComponent(input.eventId)}`,
      {
        method: "PATCH",
        body: {
          ...(input.title ? { summary: input.title } : {}),
          ...(input.description ? { description: input.description } : {}),
          ...(input.location ? { location: input.location } : {}),
          ...(input.start ? { start: { dateTime: input.start } } : {}),
          ...(input.end ? { end: { dateTime: input.end } } : {}),
        },
      },
    );

    return toCalendarEvent(updated);
  }

  async deleteEvent(eventId: string): Promise<void> {
    await this.request<void>(
      `/calendars/${encodeURIComponent(DEFAULT_CALENDAR_ID)}/events/${encodeURIComponent(eventId)}`,
      { method: "DELETE" },
    );
  }
}

/** Reutiliza OAuth/token refresh da Sprint 86 — sem duplicar implementação. */
export async function getGoogleCalendarProviderForCompany(
  companyId: string,
): Promise<GoogleCalendarProvider> {
  try {
    const accessToken = await resolveGmailAccessToken(companyId);
    return new GoogleCalendarProvider(accessToken);
  } catch (error) {
    if (error instanceof CalendarApiError) throw error;
    const message = error instanceof Error ? error.message : "erro desconhecido";
    if (message.includes("Nenhuma conta Gmail conectada") || message.includes("NOT_CONNECTED")) {
      throw new CalendarApiError(
        "NOT_CONNECTED",
        `Nenhuma conta Google conectada para a empresa "${companyId}". Conecte em /debug/gmail-connect.`,
      );
    }
    if (message.includes("não configurada") || message.includes("NOT_CONFIGURED")) {
      throw new CalendarApiError("NOT_CONFIGURED", message);
    }
    throw new CalendarApiError("UNKNOWN", message, { cause: error });
  }
}

export function formatEventLine(event: CalendarEventSummary): string {
  return `${event.startLabel} — ${event.title}`;
}

export function sortEventsByStart(events: GoogleCalendarEvent[]): GoogleCalendarEvent[] {
  return [...events].sort(
    (a, b) => new Date(eventStartIso(a)).getTime() - new Date(eventStartIso(b)).getTime(),
  );
}
