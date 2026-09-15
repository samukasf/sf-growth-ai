import { NextResponse } from "next/server";

import { authorizeCompanyRequest } from "@/features/auth/server/authorization";
import { upsertWhatsAppBusinessConnection } from "@/features/whatsapp/whatsapp-connection.repository";
import {
  resolveMetaGraphApiVersion,
  resolveMetaOAuthConfig,
} from "@/integrations/meta/meta.auth";

export const dynamic = "force-dynamic";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Body = {
  companyId?: string;
  code?: string;
  wabaId?: string;
  phoneNumberId?: string;
  businessId?: string;
};

type TokenResponse = {
  access_token?: string;
  token_type?: string;
};

type PhoneNumber = {
  id?: string;
  display_phone_number?: string;
  verified_name?: string;
};

function graphBase() {
  return `https://graph.facebook.com/${resolveMetaGraphApiVersion()}`;
}

async function exchangeEmbeddedSignupCode(code: string) {
  const config = resolveMetaOAuthConfig();
  if (!config) throw new Error("Meta App não configurada no servidor.");

  const params = new URLSearchParams({
    client_id: config.appId,
    client_secret: config.appSecret,
    code,
  });
  const response = await fetch(`${graphBase()}/oauth/access_token?${params.toString()}`, {
    cache: "no-store",
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Falha ao trocar código do WhatsApp por token (${response.status}): ${text.slice(0, 300)}`);
  }
  const payload = JSON.parse(text) as TokenResponse;
  if (!payload.access_token) throw new Error("A Meta não devolveu token do WhatsApp.");
  return payload;
}

async function listWabaPhoneNumbers(wabaId: string, accessToken: string): Promise<PhoneNumber[]> {
  const fields = encodeURIComponent("id,display_phone_number,verified_name");
  const response = await fetch(
    `${graphBase()}/${encodeURIComponent(wabaId)}/phone_numbers?fields=${fields}&limit=100&access_token=${encodeURIComponent(accessToken)}`,
    { cache: "no-store" },
  );
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Não foi possível validar os números do WhatsApp (${response.status}): ${text.slice(0, 300)}`);
  }
  const payload = JSON.parse(text) as { data?: PhoneNumber[] };
  return payload.data ?? [];
}

async function subscribeWabaWebhooks(wabaId: string, accessToken: string) {
  try {
    const response = await fetch(
      `${graphBase()}/${encodeURIComponent(wabaId)}/subscribed_apps`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: "{}",
        cache: "no-store",
      },
    );
    return response.ok;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const companyId = body.companyId?.trim();
  const code = body.code?.trim();
  const wabaId = body.wabaId?.trim();
  const requestedPhoneNumberId = body.phoneNumberId?.trim();

  if (!companyId || !UUID_PATTERN.test(companyId) || !code || !wabaId) {
    return NextResponse.json({ error: "Dados do Embedded Signup incompletos." }, { status: 400 });
  }

  const auth = await authorizeCompanyRequest(companyId);
  if (!auth.ok) return auth.response;

  try {
    const token = await exchangeEmbeddedSignupCode(code);
    const phoneNumbers = await listWabaPhoneNumbers(wabaId, token.access_token as string);
    const phone = requestedPhoneNumberId
      ? phoneNumbers.find((item) => item.id === requestedPhoneNumberId)
      : phoneNumbers.length === 1
        ? phoneNumbers[0]
        : undefined;

    if (!phone?.id) {
      return NextResponse.json(
        {
          error: requestedPhoneNumberId
            ? "O número escolhido não pertence à conta WhatsApp autorizada."
            : "A conta WhatsApp possui vários números. Conclua o fluxo escolhendo um número específico.",
          availablePhoneNumbers: phoneNumbers.map((item) => ({
            id: item.id ?? null,
            displayPhoneNumber: item.display_phone_number ?? null,
            verifiedName: item.verified_name ?? null,
          })),
        },
        { status: 409 },
      );
    }

    const webhookSubscribed = await subscribeWabaWebhooks(wabaId, token.access_token as string);
    const connection = await upsertWhatsAppBusinessConnection({
      companyId,
      metaBusinessId: body.businessId?.trim() || null,
      wabaId,
      phoneNumberId: phone.id,
      displayPhoneNumber: phone.display_phone_number ?? null,
      verifiedName: phone.verified_name ?? null,
      accessToken: token.access_token as string,
      tokenType: token.token_type ?? "bearer",
      status: "connected",
      webhookSubscribed,
      connectedBy: auth.user.id,
    });

    return NextResponse.json(
      {
        ok: true,
        provider: "WhatsApp Business Platform",
        phoneNumberId: connection.phoneNumberId,
        displayPhoneNumber: connection.displayPhoneNumber,
        verifiedName: connection.verifiedName,
        webhookSubscribed: connection.webhookSubscribed,
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao concluir WhatsApp Embedded Signup";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
