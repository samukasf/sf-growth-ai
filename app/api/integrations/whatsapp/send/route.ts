import { NextResponse } from "next/server";

import { authorizeCompanyRequest } from "@/features/auth/server/authorization";

export const dynamic = "force-dynamic";

type Body = {
  companyId?: string;
  to?: string;
  message?: string;
  confirm?: boolean;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const companyId = body.companyId?.trim();
  if (!companyId || !UUID_PATTERN.test(companyId)) {
    return NextResponse.json({ error: "Empresa inválida" }, { status: 400 });
  }

  const auth = await authorizeCompanyRequest(companyId);
  if (!auth.ok) return auth.response;

  if (!body.confirm) {
    return NextResponse.json({ error: "Confirmação explícita obrigatória." }, { status: 400 });
  }

  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const apiVersion = process.env.WHATSAPP_GRAPH_API_VERSION;

  if (!token || !phoneNumberId || !apiVersion) {
    return NextResponse.json(
      { error: "WhatsApp Business ainda não está configurado no ambiente." },
      { status: 503 },
    );
  }

  const to = body.to?.replace(/[^0-9]/g, "");
  const message = body.message?.trim();
  if (!to || !message) {
    return NextResponse.json({ error: "Número e mensagem são obrigatórios." }, { status: 400 });
  }

  const response = await fetch(
    `https://graph.facebook.com/${encodeURIComponent(apiVersion)}/${encodeURIComponent(phoneNumberId)}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { preview_url: false, body: message },
      }),
    },
  );

  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    return NextResponse.json(
      { error: "Falha ao enviar mensagem pelo WhatsApp Business.", details: payload },
      { status: response.status },
    );
  }

  return NextResponse.json(
    { ok: true, provider: "WhatsApp Business Platform", result: payload },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
