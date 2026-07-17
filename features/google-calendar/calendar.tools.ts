import {
  formatEventLine,
  getGoogleCalendarProviderForCompany,
} from "./google-calendar.provider";
import { signCalendarConfirmation } from "./calendar.confirmation";
import { parseGoogleCalendarIntent } from "./calendar.intent";
import type {
  CalendarActionArgs,
  CalendarActionId,
  CalendarActionPlan,
  CalendarEventSummary,
  CalendarToolResult,
} from "./types";

function formatEventsResult(events: CalendarEventSummary[]) {
  return events.length === 0
    ? "Nenhum compromisso encontrado."
    : events.map((event) => `${formatEventLine(event)} [id:${event.id}]`).join("\n");
}

function normalizeError(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Falha na ação Google Agenda.";
}

export function buildCalendarActionPlan(
  query: string,
  companyId: string,
): CalendarActionPlan | null {
  const plan = parseGoogleCalendarIntent(query);
  if (!plan) return null;

  if (plan.requiresConfirmation) {
    plan.confirmationToken = signCalendarConfirmation({
      companyId,
      actionId: plan.actionId,
      args: plan.args,
      issuedAt: Date.now(),
    });
  }

  return plan;
}

export async function executeCalendarTool(
  companyId: string,
  actionId: CalendarActionId,
  args: CalendarActionArgs = {},
): Promise<CalendarToolResult> {
  try {
    const provider = await getGoogleCalendarProviderForCompany(companyId);

    switch (actionId) {
      case "calendar_today": {
        const events = await provider.getTodayEvents(args.dayOffset ?? 0);
        const summaries = events
          .slice(0, args.maxResults ?? 12)
          .map((event) => provider.toEventSummary(event));
        return {
          ok: true,
          surface: "calendar",
          actionId,
          summary: `Google Agenda:\n${formatEventsResult(summaries)}`,
          data: { events: summaries },
        };
      }
      case "calendar_week": {
        const events = await provider.getWeekEvents();
        const summaries = events
          .slice(0, args.maxResults ?? 25)
          .map((event) => provider.toEventSummary(event));
        return {
          ok: true,
          surface: "calendar",
          actionId,
          summary: `Google Agenda — semana:\n${formatEventsResult(summaries)}`,
          data: { events: summaries },
        };
      }
      case "calendar_search": {
        const events = await provider.searchEvents(args.query || "", args.maxResults ?? 8);
        const summaries = events.map((event) => provider.toEventSummary(event));
        return {
          ok: true,
          surface: "calendar",
          actionId,
          summary: `Resultados da Agenda:\n${formatEventsResult(summaries)}`,
          data: { events: summaries },
        };
      }
      case "calendar_availability": {
        if (!args.start || !args.end) throw new Error("start e end são obrigatórios.");
        const availability = await provider.getAvailability(args.start, args.end);
        return {
          ok: true,
          surface: "calendar",
          actionId,
          summary:
            availability.freeSlots.length === 0
              ? `Agenda ocupada no período informado (${availability.busyCount} conflito(s)).`
              : `Horários livres:\n${availability.freeSlots
                  .map((slot) => `${slot.startLabel}–${slot.endLabel}`)
                  .join("\n")}`,
          data: availability,
        };
      }
      case "calendar_create": {
        if (!args.title || !args.start || !args.end) {
          throw new Error("title, start e end são obrigatórios para criar evento.");
        }
        const event = await provider.createEvent({
          title: args.title,
          start: args.start,
          end: args.end,
          description: args.description,
          location: args.location,
        });
        const summary = provider.toEventSummary(event);
        return {
          ok: true,
          surface: "calendar",
          actionId,
          summary: `Evento criado: ${formatEventLine(summary)} [id:${summary.id}]`,
          data: { event: summary },
        };
      }
      case "calendar_update": {
        if (!args.eventId) throw new Error("eventId é obrigatório para editar evento.");
        const event = await provider.updateEvent({
          eventId: args.eventId,
          title: args.title,
          start: args.start,
          end: args.end,
          description: args.description,
          location: args.location,
        });
        const summary = provider.toEventSummary(event);
        return {
          ok: true,
          surface: "calendar",
          actionId,
          summary: `Evento atualizado: ${formatEventLine(summary)} [id:${summary.id}]`,
          data: { event: summary },
        };
      }
      case "calendar_delete": {
        if (!args.eventId) throw new Error("eventId é obrigatório para apagar evento.");
        await provider.deleteEvent(args.eventId);
        return {
          ok: true,
          surface: "calendar",
          actionId,
          summary: `Evento ${args.eventId} removido/cancelado da Google Agenda.`,
        };
      }
      default:
        return {
          ok: false,
          surface: "calendar",
          actionId,
          summary: "Ação Google Agenda desconhecida.",
          error: "UNKNOWN_ACTION",
        };
    }
  } catch (error) {
    return {
      ok: false,
      surface: "calendar",
      actionId,
      summary: normalizeError(error),
      error: normalizeError(error),
    };
  }
}

export function calendarResultToFragment(result: CalendarToolResult): string {
  const tag = result.ok ? "GOOGLE AGENDA — EXECUTADO" : "GOOGLE AGENDA — ERRO";
  return `[${tag}] ${result.summary}`;
}
