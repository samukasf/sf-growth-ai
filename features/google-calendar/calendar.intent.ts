import type { CalendarActionArgs, CalendarActionId, CalendarActionPlan } from "./types";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function mutates(actionId: CalendarActionId): boolean {
  return ["calendar_create", "calendar_update", "calendar_delete"].includes(actionId);
}

function plan(
  actionId: CalendarActionId,
  args: CalendarActionArgs,
  title: string,
  preview: string,
): CalendarActionPlan {
  return {
    surface: "calendar",
    actionId,
    args,
    requiresConfirmation: mutates(actionId),
    title,
    preview,
  };
}

function extractEventId(text: string): string | undefined {
  const match = text.match(/\b(?:id|evento|eventId)\s*[:=]?\s*([a-zA-Z0-9_-]{5,})\b/i);
  return match?.[1];
}

function extractQuery(text: string): string {
  return text
    .replace(/.*\b(?:procurar|procura|buscar|busca|pesquisar|encontrar|search)\b/i, "")
    .replace(/\b(?:na|no)?\s*(?:agenda|calend[aá]rio|calendar)\b/gi, "")
    .trim() || text.trim();
}

function parseDay(text: string, now = new Date()): Date | null {
  const normalized = normalize(text);
  const date = new Date(now);

  if (/\bhoje\b/.test(normalized)) {
    date.setHours(0, 0, 0, 0);
    return date;
  }
  if (/\bamanha\b/.test(normalized)) {
    date.setDate(date.getDate() + 1);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  const numeric = text.match(/\b(?:dia\s*)?(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?\b/);
  if (numeric) {
    const day = Number(numeric[1]);
    const month = Number(numeric[2]) - 1;
    const year = numeric[3]
      ? Number(numeric[3].length === 2 ? `20${numeric[3]}` : numeric[3])
      : now.getFullYear();
    const parsed = new Date(year, month, day);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  const dayOnly = text.match(/\bdia\s+(\d{1,2})\b/i);
  if (dayOnly) {
    const parsed = new Date(now.getFullYear(), now.getMonth(), Number(dayOnly[1]));
    if (parsed.getTime() < now.getTime()) parsed.setMonth(parsed.getMonth() + 1);
    return parsed;
  }

  return null;
}

function parseTimeAfter(text: string, marker?: RegExp): { hour: number; minute: number } | null {
  const scoped = marker ? text.match(marker)?.[1] ?? "" : text;
  const match =
    scoped.match(/\b(?:[àa]s|as|para as|pelas)\s*(\d{1,2})(?:[:h](\d{2}))?\b/i) ||
    scoped.match(/\b(\d{1,2})h(\d{2})?\b/i) ||
    scoped.match(/\b(\d{1,2}):(\d{2})\b/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2] ?? "0");
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

function toIso(day: Date, time: { hour: number; minute: number }) {
  return new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate(),
    time.hour,
    time.minute,
    0,
    0,
  ).toISOString();
}

function addMinutes(iso: string, minutes: number) {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}

function parseStartEnd(text: string): { start: string; end: string } | null {
  const day = parseDay(text);
  const startTime = parseTimeAfter(text);
  if (!day || !startTime) return null;

  const start = toIso(day, startTime);
  const endTime = parseTimeAfter(text, /\b(?:ate|até)\s+([\s\S]+)$/i);
  const end = endTime ? toIso(day, endTime) : addMinutes(start, 60);

  return {
    start,
    end: new Date(end).getTime() > new Date(start).getTime()
      ? end
      : addMinutes(start, 60),
  };
}

function extractTitle(text: string): string {
  const explicit = text.match(/\b(?:titulo|título|assunto)\s*[:=]\s*["“”']?([^"“”'\n]+)["“”']?/i)?.[1]?.trim();
  if (explicit) return explicit.slice(0, 120);

  const eventTitle =
    text.match(/\b(?:reuni[aã]o|compromisso|evento|call)\s+(?:com|sobre|de)?\s*([^,.;\n]+?)(?:\s+\b(?:hoje|amanh[aã]|dia|[àa]s|as|\d{1,2}[/-]\d{1,2})\b|$)/i)?.[1]?.trim() ||
    text.match(/\b(?:agendar|marcar|criar)\s+([^,.;\n]+?)(?:\s+\b(?:hoje|amanh[aã]|dia|[àa]s|as|\d{1,2}[/-]\d{1,2})\b|$)/i)?.[1]?.trim();

  if (!eventTitle || eventTitle.length < 3) return "Compromisso com Samuel AI";
  return eventTitle.replace(/\s+/g, " ").slice(0, 120);
}

function formatPreviewDate(start?: string, end?: string) {
  if (!start || !end) return "data/horário em falta";
  return `${new Date(start).toLocaleString("pt-BR")} até ${new Date(end).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

/**
 * Interpreta pedidos em linguagem natural sobre Google Agenda.
 * Escritas reais são sempre marcadas para confirmação explícita na UI.
 */
export function parseGoogleCalendarIntent(query: string): CalendarActionPlan | null {
  const normalized = normalize(query);
  const aboutCalendar =
    /\b(agenda|calendar|calendario|calendario|compromisso|evento|reuniao|meeting|call)\b/.test(normalized) ||
    /\b(agendar|marcar|remarcar|desmarcar|cancelar compromisso|cancelar evento)\b/.test(normalized);

  if (!aboutCalendar) return null;

  const eventId = extractEventId(query);

  if (/\b(disponibilidade|livre|horarios livres|tempo livre|free)\b/.test(normalized)) {
    const range = parseStartEnd(query);
    const day = parseDay(query) ?? new Date();
    const start = range?.start ?? toIso(day, { hour: 9, minute: 0 });
    const end = range?.end ?? toIso(day, { hour: 18, minute: 0 });
    return plan(
      "calendar_availability",
      { start, end },
      "Consultar disponibilidade",
      `Ver horários livres em ${formatPreviewDate(start, end)}.`,
    );
  }

  if (/\b(cancelar|apagar|excluir|remover|deletar|desmarcar)\b/.test(normalized)) {
    if (!eventId) {
      return plan(
        "calendar_today",
        { dayOffset: /\bamanha\b/.test(normalized) ? 1 : 0, maxResults: 8 },
        "Listar eventos para cancelar",
        "Preciso do ID do evento antes de cancelar. Vou listar os eventos próximos.",
      );
    }
    return plan(
      "calendar_delete",
      { eventId },
      "Cancelar evento da Agenda",
      `Cancelar/apagar o evento ${eventId} do Google Agenda.`,
    );
  }

  if (/\b(remarcar|alterar|editar|mudar|atualizar)\b/.test(normalized)) {
    const range = parseStartEnd(query);
    const title = extractTitle(query);
    if (!eventId) {
      return plan(
        "calendar_search",
        { query: title, maxResults: 8 },
        "Encontrar evento para editar",
        "Preciso do ID do evento antes de alterar. Vou procurar eventos relacionados.",
      );
    }
    return plan(
      "calendar_update",
      {
        eventId,
        title: title === "Compromisso com Samuel AI" ? undefined : title,
        start: range?.start,
        end: range?.end,
      },
      "Editar evento da Agenda",
      `Atualizar o evento ${eventId}${range ? ` para ${formatPreviewDate(range.start, range.end)}` : ""}.`,
    );
  }

  if (/\b(agendar|marcar|criar|adicionar|nova reuniao|novo evento|novo compromisso)\b/.test(normalized)) {
    const range = parseStartEnd(query);
    const title = extractTitle(query);
    if (!range) {
      return plan(
        "calendar_today",
        { dayOffset: /\bamanha\b/.test(normalized) ? 1 : 0, maxResults: 8 },
        "Data ou horário em falta",
        "Para criar um evento real, indique data e horário (ex.: amanhã às 10h).",
      );
    }
    return plan(
      "calendar_create",
      { title, start: range.start, end: range.end },
      "Criar evento na Agenda",
      `Criar "${title}" em ${formatPreviewDate(range.start, range.end)}.`,
    );
  }

  if (/\b(semana|week)\b/.test(normalized)) {
    return plan("calendar_week", { maxResults: 25 }, "Ver semana", "Listar compromissos desta semana.");
  }

  if (/\b(procurar|procura|buscar|busca|pesquisar|encontrar|search)\b/.test(normalized)) {
    const searchQuery = extractQuery(query);
    return plan(
      "calendar_search",
      { query: searchQuery, maxResults: 8 },
      "Pesquisar Agenda",
      `Pesquisar eventos por: ${searchQuery}`,
    );
  }

  if (/\b(amanha)\b/.test(normalized)) {
    return plan("calendar_today", { dayOffset: 1, maxResults: 12 }, "Agenda de amanhã", "Listar compromissos de amanhã.");
  }

  return plan("calendar_today", { dayOffset: 0, maxResults: 12 }, "Agenda de hoje", "Listar compromissos de hoje.");
}
