import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

import { resolveMetaOAuthConfig } from "@/integrations/meta/meta.auth";

export const dynamic = "force-dynamic";

function verifySignature(rawBody: string, signatureHeader: string | null) {
  const config = resolveMetaOAuthConfig();
  if (!config || !signatureHeader?.startsWith("sha256=")) return false;
  const received = signatureHeader.slice("sha256=".length).trim().toLowerCase();
  const expected = createHmac("sha256", config.appSecret).update(rawBody).digest("hex");
  const receivedBuffer = Buffer.from(received, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  return (
    receivedBuffer.length === expectedBuffer.length &&
    receivedBuffer.length > 0 &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const verifyToken = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const expectedToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN?.trim();

  if (
    mode === "subscribe" &&
    expectedToken &&
    verifyToken === expectedToken &&
    challenge
  ) {
    return new NextResponse(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain", "Cache-Control": "no-store" },
    });
  }

  return NextResponse.json({ error: "Webhook verification failed" }, { status: 403 });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!verifySignature(rawBody, request.headers.get("x-hub-signature-256"))) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  try {
    const payload = JSON.parse(rawBody) as { object?: string };
    if (payload.object !== "whatsapp_business_account") {
      return NextResponse.json({ ok: true, ignored: true });
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Delivery is authenticated above. Message/status persistence and Samuel
  // automations can consume this verified endpoint without exposing it to users.
  return NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store" } },
  );
}
