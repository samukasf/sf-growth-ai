import { createHmac, timingSafeEqual } from "node:crypto";

import type { GmailActionArgs, GmailActionId } from "./gmail.types";

const GMAIL_ACTION_IDS = new Set<GmailActionId>([
  "gmail_inbox",
  "gmail_search",
  "gmail_read",
  "gmail_unread_count",
  "gmail_draft",
  "gmail_reply_draft",
  "gmail_send",
  "gmail_reply",
  "gmail_archive",
  "gmail_trash",
  "gmail_mark_read",
  "gmail_mark_unread",
  "gmail_star",
  "gmail_label",
  "gmail_list_labels",
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

export type GmailConfirmationPayload = {
  companyId: string;
  actionId: GmailActionId;
  args: GmailActionArgs;
  issuedAt: number;
};

export function signGmailConfirmation(payload: GmailConfirmationPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${signature}`;
}

export function verifyGmailConfirmation(token: string): GmailConfirmationPayload {
  const [body, signature] = token.split(".");
  if (!body || !signature) {
    throw new Error("Token de confirmação Gmail inválido.");
  }

  const expected = createHmac("sha256", secret()).update(body).digest("base64url");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error("Assinatura do token Gmail inválida.");
  }

  const payload = JSON.parse(
    Buffer.from(body, "base64url").toString("utf8"),
  ) as GmailConfirmationPayload;
  const maxAgeMs = 15 * 60 * 1000;
  if (
    !payload.companyId ||
    !payload.actionId ||
    !GMAIL_ACTION_IDS.has(payload.actionId) ||
    !payload.issuedAt
  ) {
    throw new Error("Payload de confirmação Gmail incompleto ou inválido.");
  }
  if (Date.now() - payload.issuedAt > maxAgeMs || payload.issuedAt > Date.now() + 60_000) {
    throw new Error("Token de confirmação Gmail expirado. Peça a ação novamente.");
  }

  return payload;
}
