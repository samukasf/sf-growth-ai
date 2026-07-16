import "server-only";

import { getGoogleCalendarProviderForCompany } from "@/features/google-calendar/google-calendar.provider";
import type { CalendarEvent } from "@/features/google-calendar/types";
import { getGoogleDriveProviderForCompany } from "@/features/google-drive/google-drive.provider";
import {
  findGoogleOAuthConnection,
  getGmailClientForCompany,
} from "@/integrations/gmail";

import type {
  GoogleWorkspaceCalendarEvent,
  GoogleWorkspaceServiceStatus,
  GoogleWorkspaceSummary,
} from "./google-workspace.types";

const SCOPES = {
  gmail: "https://www.googleapis.com/auth/gmail.readonly",
  calendar: "https://www.googleapis.com/auth/calendar",
  drive: "https://www.googleapis.com/auth/drive.readonly",
  contacts: "https://www.googleapis.com/auth/contacts.readonly",
} as const;

function accountLabel(email: string | null): string | null {
  if (!email) return null;
  const [name, domain] = email.split("@");
  if (!name || !domain) return "Conta Google ligada";
  return `${name.slice(0, 2)}•••@${domain}`;
}

function enabled(count: number | null): GoogleWorkspaceServiceStatus {
  return { connected: true, count };
}

function failed(error: unknown): GoogleWorkspaceServiceStatus {
  return {
    connected: false,
    count: null,
    error: error instanceof Error ? error.message : "Integração temporariamente indisponível",
  };
}

function compact(value: string | undefined, maxLength: number) {
  const normalized = value?.replace(/\s+/g, " ").trim();
  if (!normalized) return undefined;
  return normalized.length > maxLength
    ? `${normalized.slice(0, maxLength - 1).trimEnd()}…`
    : normalized;
}

function calendarEventSnapshot(event: CalendarEvent): GoogleWorkspaceCalendarEvent {
  const location = compact(event.location, 120);
  return {
    id: event.id,
    title: compact(event.summary, 160) ?? "Compromisso sem título",
    start: event.start.dateTime ?? `${event.start.date}T00:00:00`,
    end: event.end.dateTime ?? `${event.end.date}T23:59:59`,
    allDay: !event.start.dateTime,
    ...(location ? { location } : {}),
  };
}

function buildCalendarStatus(events: CalendarEvent[]) {
  const snapshots = events.slice(0, 8).map(calendarEventSnapshot);
  const now = Date.now();
  const nextEvent = snapshots.find((event) => {
    const end = Date.parse(event.end);
    return Number.isFinite(end) && end >= now;
  }) ?? null;

  return {
    connected: true,
    count: events.length,
    events: snapshots,
    nextEvent,
  };
}

export async function buildGoogleWorkspaceSummary(
  companyId: string,
): Promise<GoogleWorkspaceSummary> {
  const connection = await findGoogleOAuthConnection(companyId);
  const empty = { connected: false, count: null };

  if (!connection) {
    return {
      connected: false,
      accountLabel: null,
      updatedAt: new Date().toISOString(),
      gmail: empty,
      calendar: empty,
      drive: empty,
      contacts: empty,
    };
  }

  const granted = new Set(connection.scope.split(/\s+/).filter(Boolean));
  const tasks = await Promise.allSettled([
    granted.has(SCOPES.gmail)
      ? getGmailClientForCompany(companyId).then((client) => client.getUnreadCount())
      : Promise.reject(new Error("Permissão do Gmail não concedida")),
    granted.has(SCOPES.calendar)
      ? getGoogleCalendarProviderForCompany(companyId).then((provider) => provider.getTodayEvents())
      : Promise.reject(new Error("Permissão da Agenda não concedida")),
    granted.has(SCOPES.drive)
      ? getGoogleDriveProviderForCompany(companyId).then((provider) => provider.listRecent(8))
      : Promise.reject(new Error("Permissão do Drive não concedida")),
  ]);

  const gmail = tasks[0].status === "fulfilled" ? enabled(tasks[0].value) : failed(tasks[0].reason);
  const calendar = tasks[1].status === "fulfilled"
    ? buildCalendarStatus(tasks[1].value)
    : failed(tasks[1].reason);
  const drive = tasks[2].status === "fulfilled" ? enabled(tasks[2].value.length) : failed(tasks[2].reason);

  return {
    connected: gmail.connected || calendar.connected || drive.connected,
    accountLabel: accountLabel(connection.googleEmail),
    updatedAt: new Date().toISOString(),
    gmail,
    calendar,
    drive,
    contacts: granted.has(SCOPES.contacts) ? enabled(null) : empty,
  };
}
