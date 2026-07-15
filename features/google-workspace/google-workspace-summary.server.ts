import "server-only";

import { getGoogleCalendarProviderForCompany } from "@/features/google-calendar/google-calendar.provider";
import { getGoogleDriveProviderForCompany } from "@/features/google-drive/google-drive.provider";
import {
  findGoogleOAuthConnection,
  getGmailClientForCompany,
} from "@/integrations/gmail";

import type {
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
  const calendar = tasks[1].status === "fulfilled" ? enabled(tasks[1].value.length) : failed(tasks[1].reason);
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
