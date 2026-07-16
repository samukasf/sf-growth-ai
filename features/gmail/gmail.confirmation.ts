import { createHmac, timingSafeEqual } from "node:crypto";

import type { GmailActionArgs, GmailActionId } from "./gmail.types";

function secret() {
  return (
    process.env.GOOGLE_CLIENT_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "sf-growth-ai-gmail-dev-secret"
  );
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

  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as GmailConfirmationPayload;
  const maxAgeMs = 15 * 60 * 1000;
  if (!payload.companyId || !payload.actionId || !payload.issuedAt) {
    throw new Error("Payload de confirmação Gmail incompleto.");
  }
  if (Date.now() - payload.issuedAt > maxAgeMs || payload.issuedAt > Date.now() + 60_000) {
    throw new Error("Token de confirmação Gmail expirado. Peça a ação novamente.");
  }

  return payload;
}
