import { getSupabaseServiceClient } from "@/lib/supabase/service-client";

import { MetaApiError } from "./meta.types";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type MetaOAuthConnection = {
  id: string;
  companyId: string;
  pageId: string;
  pageName: string | null;
  accessToken: string;
  tokenType: string | null;
  expiresAt: string | null;
  scopes: string | null;
  connectedBy: string | null;
  createdAt: string;
  updatedAt: string;
};

type MetaOAuthConnectionRow = {
  id: string;
  company_id: string;
  page_id: string;
  page_name: string | null;
  access_token: string;
  token_type: string | null;
  expires_at: string | null;
  scopes: string | null;
  connected_by: string | null;
  created_at: string;
  updated_at: string;
};

function fromRow(row: MetaOAuthConnectionRow): MetaOAuthConnection {
  return {
    id: row.id,
    companyId: row.company_id,
    pageId: row.page_id,
    pageName: row.page_name,
    accessToken: row.access_token,
    tokenType: row.token_type,
    expiresAt: row.expires_at,
    scopes: row.scopes,
    connectedBy: row.connected_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function requireCompanyId(companyId: string) {
  if (!UUID_PATTERN.test(companyId)) {
    throw new MetaApiError("AUTH_ERROR", `companyId inválido para Meta OAuth: ${companyId}`);
  }
}

export async function findMetaOAuthConnection(
  companyId: string,
): Promise<MetaOAuthConnection | null> {
  requireCompanyId(companyId);
  const { data, error } = await getSupabaseServiceClient()
    .from("meta_oauth_connections")
    .select("*")
    .eq("company_id", companyId)
    .maybeSingle();

  if (error) {
    throw new MetaApiError("UNKNOWN", `Falha ao consultar conexão Meta: ${error.message}`, {
      cause: error,
    });
  }

  return data ? fromRow(data as MetaOAuthConnectionRow) : null;
}

export async function upsertMetaOAuthConnection(input: {
  companyId: string;
  pageId: string;
  pageName?: string | null;
  accessToken: string;
  tokenType?: string | null;
  expiresAt?: string | null;
  scopes?: string | null;
  connectedBy?: string | null;
}): Promise<MetaOAuthConnection> {
  requireCompanyId(input.companyId);

  const { data, error } = await getSupabaseServiceClient()
    .from("meta_oauth_connections")
    .upsert(
      {
        company_id: input.companyId,
        page_id: input.pageId,
        page_name: input.pageName ?? null,
        access_token: input.accessToken,
        token_type: input.tokenType ?? null,
        expires_at: input.expiresAt ?? null,
        scopes: input.scopes ?? null,
        connected_by: input.connectedBy ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "company_id" },
    )
    .select("*")
    .single();

  if (error) {
    throw new MetaApiError("UNKNOWN", `Falha ao salvar conexão Meta: ${error.message}`, {
      cause: error,
    });
  }

  return fromRow(data as MetaOAuthConnectionRow);
}
