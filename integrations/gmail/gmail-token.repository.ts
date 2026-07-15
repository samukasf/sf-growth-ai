import { getSupabaseServiceClient } from "@/lib/supabase/service-client";

import { GmailApiError } from "./gmail.types";
import type { GoogleOAuthConnection, UpsertGoogleOAuthConnectionInput } from "./gmail.types";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuidLike(value: string): boolean {
  return UUID_PATTERN.test(value);
}

function describeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  return "erro desconhecido";
}

type GoogleOAuthConnectionRow = {
  id: string;
  company_id: string;
  google_email: string | null;
  scope: string;
  access_token: string | null;
  access_token_expires_at: string | null;
  refresh_token: string;
  connected_by: string | null;
  created_at: string;
  updated_at: string;
};

function fromRow(row: GoogleOAuthConnectionRow): GoogleOAuthConnection {
  return {
    id: row.id,
    companyId: row.company_id,
    googleEmail: row.google_email,
    scope: row.scope,
    accessToken: row.access_token,
    accessTokenExpiresAt: row.access_token_expires_at,
    refreshToken: row.refresh_token,
    connectedBy: row.connected_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function requireValidCompanyId(companyId: string): void {
  if (!isUuidLike(companyId)) {
    throw new GmailApiError(
      "INVALID_COMPANY_ID",
      `companyId inválido para conexão Gmail: "${companyId}".`,
    );
  }
}

export async function findGoogleOAuthConnection(
  companyId: string,
): Promise<GoogleOAuthConnection | null> {
  requireValidCompanyId(companyId);

  const { data, error } = await getSupabaseServiceClient()
    .from("google_oauth_connections")
    .select("*")
    .eq("company_id", companyId)
    .maybeSingle();

  if (error) {
    throw new GmailApiError(
      "UNKNOWN",
      `Falha ao consultar conexão Gmail: ${describeError(error)}`,
      { cause: error },
    );
  }

  return data ? fromRow(data as GoogleOAuthConnectionRow) : null;
}

export async function upsertGoogleOAuthConnection(
  input: UpsertGoogleOAuthConnectionInput,
): Promise<GoogleOAuthConnection> {
  requireValidCompanyId(input.companyId);

  const { data, error } = await getSupabaseServiceClient()
    .from("google_oauth_connections")
    .upsert(
      {
        company_id: input.companyId,
        google_email: input.googleEmail,
        scope: input.scope,
        access_token: input.accessToken,
        access_token_expires_at: input.accessTokenExpiresAt,
        refresh_token: input.refreshToken,
        connected_by: input.connectedBy ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "company_id" },
    )
    .select("*")
    .single();

  if (error) {
    throw new GmailApiError(
      "UNKNOWN",
      `Falha ao salvar conexão Gmail: ${describeError(error)}`,
      { cause: error },
    );
  }

  return fromRow(data as GoogleOAuthConnectionRow);
}

export async function updateGoogleOAuthAccessToken(
  companyId: string,
  accessToken: string,
  accessTokenExpiresAt: string,
): Promise<void> {
  requireValidCompanyId(companyId);

  const { error } = await getSupabaseServiceClient()
    .from("google_oauth_connections")
    .update({
      access_token: accessToken,
      access_token_expires_at: accessTokenExpiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq("company_id", companyId);

  if (error) {
    throw new GmailApiError(
      "UNKNOWN",
      `Falha ao atualizar access_token do Gmail: ${describeError(error)}`,
      { cause: error },
    );
  }
}

