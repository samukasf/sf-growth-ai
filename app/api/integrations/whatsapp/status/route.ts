import { NextResponse } from "next/server";

import { authorizeCompanyRequest } from "@/features/auth/server/authorization";

export const dynamic = "force-dynamic";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: Request) {
  const companyId = new URL(request.url).searchParams.get("companyId")?.trim();
  if (!companyId || !UUID_PATTERN.test(companyId)) {
    return NextResponse.json({ error: "Empresa inválida" }, { status: 400 });
  }

  const auth = await authorizeCompanyRequest(companyId);
  if (!auth.ok) return auth.response;

  const configured = Boolean(
    process.env.WHATSAPP_ACCESS_TOKEN &&
    process.env.WHATSAPP_PHONE_NUMBER_ID &&
    process.env.WHATSAPP_GRAPH_API_VERSION,
  );

  return NextResponse.json(
    {
      configured,
      provider: "WhatsApp Business Platform",
      phoneNumberIdConfigured: Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID),
      businessAccountConfigured: Boolean(process.env.WHATSAPP_BUSINESS_ACCOUNT_ID),
      webhookConfigured: Boolean(process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN),
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
