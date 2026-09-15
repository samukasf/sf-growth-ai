import "server-only";

import { getSupabaseServiceClient } from "@/lib/supabase/service-client";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type WhatsAppBusinessConnection = {
  id: string;
  companyId: string;
  metaBusinessId: string | null;
  wabaId: string;
  phoneNumberId: string;
  displayPhoneNumber: string | null;
  verifiedName: string | null;
  accessToken: string;
  tokenType: string | null;
  scopes: string | null;
  status: string;
  webhookSubscribed: boolean;
  connectedBy: string | null;
  createdAt: string;
  updatedAt: string;
};

type Row = {
  id: string;
  company_id: string;
  meta_business_id: string | null;
  waba_id: string;
  phone_number_id: string;
  display_phone_number: string | null;
  verified_name: string | null;
  access_token: string;
  token_type: string | null;
  scopes: string | null;
  status: string;
  webhook_subscribed: boolean;
  connected_by: string | null;
  created_at: string;
  updated_at: string;
};

function requireCompanyId(companyId: string) {
  if (!UUID_PATTERN.test(companyId)) throw new Error("companyId inválido para WhatsApp Business");
}

function fromRow(row: Row): WhatsAppBusinessConnection {
  return {
    id: row.id,
    companyId: row.company_id,
    metaBusinessId: row.meta_business_id,
    wabaId: row.waba_id,
    phoneNumberId: row.phone_number_id,
    displayPhoneNumber: row.display_phone_number,
    verifiedName: row.verified_name,
    accessToken: row.access_token,
    tokenType: row.token_type,
    scopes: row.scopes,
    status: row.status,
    webhookSubscribed: Boolean(row.webhook_subscribed),
    connectedBy: row.connected_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function findWhatsAppBusinessConnection(
  companyId: string,
): Promise<WhatsAppBusinessConnection | null> {
  requireCompanyId(companyId);
  const { data, error } = await getSupabaseServiceClient()
    .from("whatsapp_business_connections")
    .select("*")
    .eq("company_id", companyId)
    .maybeSingle();

  if (error) throw new Error(`Falha ao consultar conexão WhatsApp: ${error.message}`);
  return data ? fromRow(data as Row) : null;
}

export async function upsertWhatsAppBusinessConnection(input: {
  companyId: string;
  metaBusinessId?: string | null;
  wabaId: string;
  phoneNumberId: string;
  displayPhoneNumber?: string | null;
  verifiedName?: string | null;
  accessToken: string;
  tokenType?: string | null;
  scopes?: string | null;
  status?: string;
  webhookSubscribed?: boolean;
  connectedBy?: string | null;
}): Promise<WhatsAppBusinessConnection> {
  requireCompanyId(input.companyId);
  const { data, error } = await getSupabaseServiceClient()
    .from("whatsapp_business_connections")
    .upsert(
      {
        company_id: input.companyId,
        meta_business_id: input.metaBusinessId ?? null,
        waba_id: input.wabaId,
        phone_number_id: input.phoneNumberId,
        display_phone_number: input.displayPhoneNumber ?? null,
        verified_name: input.verifiedName ?? null,
        access_token: input.accessToken,
        token_type: input.tokenType ?? "bearer",
        scopes: input.scopes ?? null,
        status: input.status ?? "connected",
        webhook_subscribed: input.webhookSubscribed ?? false,
        connected_by: input.connectedBy ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "company_id" },
    )
    .select("*")
    .single();

  if (error) throw new Error(`Falha ao salvar conexão WhatsApp: ${error.message}`);
  return fromRow(data as Row);
}
