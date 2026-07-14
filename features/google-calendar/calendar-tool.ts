/**
 * Google Calendar Tool (Sprint 88) — acessa o Google Calendar real da empresa
 * via Tool Orchestrator, reutilizando OAuth/token refresh da Sprint 86.
 */
import { ToolExecutionError } from "@/features/samuel-tool-orchestrator/tool-execution-error";
import type { Tool, ToolExecutionContext } from "@/features/samuel-tool-orchestrator/types";

import {
  formatEventLine,
  getGoogleCalendarProviderForCompany,
} from "./google-calendar.provider";
import type {
  CalendarActionId,
  CalendarApiError,
  CalendarEventSummary,
  CalendarToolInput,
  CalendarToolOutput,
} from "./types";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DEFAULT_MAX_RESULTS = 25;

function isUuidLike(value: string | undefined): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

function describeError(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "erro desconhecido";
}

function wrapCalendarError(error: unknown): never {
  throw new ToolExecutionError("google-calendar", describeError(error), error);
}

function isCalendarToolEnabled(): boolean {
  return process.env.SAMUEL_GOOGLE_CALENDAR_TOOL_ENABLED !== "false";
}

function buildListOutput(
  actionId: CalendarActionId,
  label: string,
  events: CalendarEventSummary[],
): CalendarToolOutput {
  const preview = events.map(formatEventLine).join("\n");
  return {
    actionId,
    summary:
      events.length > 0
        ? `${events.length} compromisso(s) ${label}.`
        : `Nenhum compromisso ${label}.`,
    data: {
      eventCount: events.length,
      events,
      preview,
    },
  };
}

async function resolveLatestEventId(companyId: string): Promise<string> {
  const provider = await getGoogleCalendarProviderForCompany(companyId);
  const events = await provider.getTodayEvents();
  if (events.length === 0) {
    throw new ToolExecutionError(
      "google-calendar",
      "Nenhum evento encontrado no calendário para esta operação.",
    );
  }
  return events[0].id;
}

const ACTION_HANDLERS: Record<
  CalendarActionId,
  (companyId: string, input: CalendarToolInput) => Promise<CalendarToolOutput>
> = {
  calendar_today: async (companyId, input) => {
    const provider = await getGoogleCalendarProviderForCompany(companyId);
    const events = (await provider.getTodayEvents(input.dayOffset ?? 0)).map((event) =>
      provider.toEventSummary(event),
    );
    const label =
      (input.dayOffset ?? 0) === 0
        ? "para hoje"
        : (input.dayOffset ?? 0) === 1
          ? "para amanhã"
          : `no dia +${input.dayOffset}`;
    return buildListOutput("calendar_today", label, events);
  },
  calendar_week: async (companyId) => {
    const provider = await getGoogleCalendarProviderForCompany(companyId);
    const events = (await provider.getWeekEvents()).map((event) => provider.toEventSummary(event));
    return buildListOutput("calendar_week", "nesta semana", events);
  },
  calendar_search: async (companyId, input) => {
    const query = input.query?.trim();
    if (!query) {
      throw new ToolExecutionError("google-calendar", "Termo de busca ausente para calendar_search.");
    }
    const provider = await getGoogleCalendarProviderForCompany(companyId);
    const events = (await provider.searchEvents(query, input.maxResults ?? DEFAULT_MAX_RESULTS)).map(
      (event) => provider.toEventSummary(event),
    );
    return {
      actionId: "calendar_search",
      summary:
        events.length > 0
          ? `${events.length} evento(s) encontrado(s) para "${query}".`
          : `Nenhum evento encontrado para "${query}".`,
      data: {
        query,
        eventCount: events.length,
        events,
        preview: events.map(formatEventLine).join("\n"),
      },
    };
  },
  calendar_availability: async (companyId, input) => {
    const provider = await getGoogleCalendarProviderForCompany(companyId);
    const dayOffset = input.dayOffset ?? 0;
    const timeMin = new Date();
    timeMin.setDate(timeMin.getDate() + dayOffset);
    timeMin.setHours(0, 0, 0, 0);
    const timeMax = new Date(timeMin);
    timeMax.setHours(23, 59, 59, 999);

    const availability = await provider.getAvailability(timeMin.toISOString(), timeMax.toISOString());
    const preview = availability.freeSlots
      .map((slot) => `Livre: ${slot.startLabel} — ${slot.endLabel}`)
      .join("\n");

    return {
      actionId: "calendar_availability",
      summary:
        availability.freeSlots.length > 0
          ? `${availability.freeSlots.length} janela(s) livre(s) encontrada(s).`
          : "Nenhuma janela livre encontrada no horário comercial.",
      data: {
        eventCount: availability.busyCount,
        freeSlots: availability.freeSlots,
        preview,
      },
    };
  },
  calendar_create: async (companyId, input) => {
    const title = input.title?.trim();
    const start = input.start?.trim();
    const end = input.end?.trim();

    if (!title || !start || !end) {
      throw new ToolExecutionError(
        "google-calendar",
        "calendar_create exige title, start e end — informe título e horário do evento.",
      );
    }

    const provider = await getGoogleCalendarProviderForCompany(companyId);
    const created = await provider.createEvent({
      title,
      start,
      end,
      description: input.description,
      location: input.location,
    });
    const summary = provider.toEventSummary(created);

    return {
      actionId: "calendar_create",
      summary: `Evento "${summary.title}" criado para ${summary.startLabel}.`,
      data: {
        eventCount: 1,
        event: summary,
        preview: formatEventLine(summary),
      },
    };
  },
  calendar_update: async (companyId, input) => {
    const eventId = input.eventId ?? (await resolveLatestEventId(companyId));
    const provider = await getGoogleCalendarProviderForCompany(companyId);
    const updated = await provider.updateEvent({
      eventId,
      title: input.title,
      start: input.start,
      end: input.end,
      description: input.description,
      location: input.location,
    });
    const summary = provider.toEventSummary(updated);

    return {
      actionId: "calendar_update",
      summary: `Evento "${summary.title}" atualizado.`,
      data: {
        eventCount: 1,
        event: summary,
        preview: formatEventLine(summary),
      },
    };
  },
  calendar_delete: async (companyId, input) => {
    const eventId = input.eventId ?? (await resolveLatestEventId(companyId));
    const provider = await getGoogleCalendarProviderForCompany(companyId);
    await provider.deleteEvent(eventId);

    return {
      actionId: "calendar_delete",
      summary: "Evento excluído com sucesso.",
      data: {
        eventCount: 0,
        deletedEventId: eventId,
      },
    };
  },
};

export class CalendarTool implements Tool<CalendarToolInput, CalendarToolOutput> {
  readonly name = "google-calendar";
  readonly description =
    "Acessa o Google Calendar real da empresa: agenda de hoje/semana, busca, disponibilidade e CRUD de eventos.";
  readonly inputSchema = {
    actionId:
      "'calendar_today' | 'calendar_week' | 'calendar_search' | 'calendar_create' | 'calendar_update' | 'calendar_delete' | 'calendar_availability'",
    query: "string (calendar_search)",
    eventId: "string (calendar_update, calendar_delete)",
    title: "string (calendar_create, calendar_update)",
    start: "string ISO (calendar_create, calendar_update)",
    end: "string ISO (calendar_create, calendar_update)",
    dayOffset: "number (calendar_today, calendar_availability)",
    maxResults: "number (opcional)",
  };

  async execute(context: ToolExecutionContext<CalendarToolInput>): Promise<CalendarToolOutput> {
    if (!isCalendarToolEnabled()) {
      throw new ToolExecutionError(
        this.name,
        "Google Calendar Tool está desabilitada (SAMUEL_GOOGLE_CALENDAR_TOOL_ENABLED=false).",
      );
    }

    const { actionId } = context.input;
    const handler = ACTION_HANDLERS[actionId];
    if (!handler) {
      throw new ToolExecutionError(
        this.name,
        `actionId desconhecido ou não autorizado: "${actionId}".`,
      );
    }

    if (!isUuidLike(context.companyId)) {
      throw new ToolExecutionError(
        this.name,
        `companyId ausente ou inválido — não é possível acessar o calendário para "${context.companyId ?? "undefined"}".`,
      );
    }

    try {
      return await handler(context.companyId, context.input);
    } catch (error) {
      if (error instanceof ToolExecutionError) throw error;
      wrapCalendarError(error);
    }
  }
}

export type { CalendarApiError };
