import { createHmac, timingSafeEqual } from "node:crypto";

import type { CalendarActionArgs, CalendarActionId } from "./types";

const CALENDAR_ACTION_IDS = new Set<CalendarActionId>([
  "calendar_today",
  "calendar_week",
  "calendar_search",
  "calendar_create",
  "calendar_update",
  "calendar_delete",
  "calendar_availability",
]);

function secret() {
  const configured =
    process.env.SAMUEL_ACTION_CONFIRMATION_SECRET ||
    process.env.GOOGLE_CLIENT_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (configured) return configured;
  if (process.env.NODE_ENV === "test") return "sf-growth-ai-test-confirmation-secret";
  throw new Error("Segredo de confirmação de ações não configurado.");
}

export type CalendarConfirmationPayload = {
  companyId: string;
  actionId: CalendarActionId;
  args: CalendarActionArgs;
  issuedAt: number;
};

export function signCalendarConfirmation(payload: CalendarConfirmationPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${signature}`;
}

export function verifyCalendarConfirmation(token: string): CalendarConfirmationPayload {
  const [body, signature] = token.split(".");
  if (!body || !signature) {
    throw new Error("Token de confirmação Google Agenda inválido.");
  }

  const expected = createHmac("sha256", secret()).update(body).digest("base64url");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error("Assinatura do token Google Agenda inválida.");
  }

  const payload = JSON.parse(
    Buffer.from(body, "base64url").toString("utf8"),
  ) as CalendarConfirmationPayload;
  const maxAgeMs = 15 * 60 * 1000;
  if (
    !payload.companyId ||
    !payload.actionId ||
    !CALENDAR_ACTION_IDS.has(payload.actionId) ||
    !payload.issuedAt
  ) {
    throw new Error("Payload de confirmação Google Agenda incompleto ou inválido.");
  }
  if (Date.now() - payload.issuedAt > maxAgeMs || payload.issuedAt > Date.now() + 60_000) {
    throw new Error("Token de confirmação Google Agenda expirado. Peça a ação novamente.");
  }

  return payload;
}
