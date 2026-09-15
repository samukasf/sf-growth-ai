import { getSupabaseServiceClient } from "@/lib/supabase/service-client";

import { MetaApiError } from "./meta.types";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type MetaAssetType =
  | "facebook_page"
  | "instagram_account"
  | "ad_account"
  | "business";

export type MetaOAuthConnection = {
  id: string;
  companyId: string;
  pageId: string;
  pageName: string | null;
  accessToken: string;
  userAccessToken: string | null;
  tokenType: string | null;
  expiresAt: string | null;
  scopes: string | null;
  metaUserId: string | null;
  metaUserName: string | null;
  businessId: string | null;
  instagramBusinessId: string | null;
  instagramUsername: string | null;
  adAccountId: string | null;
  adAccountName: string | null;
  selectedExplicitly: boolean;
  connectedBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MetaConnectedAsset = {
  id: string;
  companyId: string;
  connectionId: string | null;
  assetType: MetaAssetType;
  assetId: string;
  assetName: string | null;
  parentAssetId: string | null;
  accessToken: string | null;
  metadata: Record<string, unknown>;
  isSelected: boolean;
  createdAt: string;
  updatedAt: string;
};

type MetaOAuthConnectionRow = {
  id: string;
  company_id: string;
  page_id: string;
  page_name: string | null;
  access_token: string;
  user_access_token: string | null;
  token_type: string | null;
  expires_at: string | null;
  scopes: string | null;
  meta_user_id: string | null;
  meta_user_name: string | null;
  business_id: string | null;
  instagram_business_id: string | null;
  instagram_username: string | null;
  ad_account_id: string | null;
  ad_account_name: string | null;
  selected_explicitly: boolean;
  connected_by: string | null;
  created_at: string;
  updated_at: string;
};

type MetaConnectedAssetRow = {
  id: string;
  company_id: string;
  connection_id: string | null;
  asset_type: MetaAssetType;
  asset_id: string;
  asset_name: string | null;
  parent_asset_id: string | null;
  access_token: string | null;
  metadata: Record<string, unknown> | null;
  is_selected: boolean;
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
    userAccessToken: row.user_access_token,
    tokenType: row.token_type,
    expiresAt: row.expires_at,
    scopes: row.scopes,
    metaUserId: row.meta_user_id,
    metaUserName: row.meta_user_name,
    businessId: row.business_id,
    instagramBusinessId: row.instagram_business_id,
    instagramUsername: row.instagram_username,
    adAccountId: row.ad_account_id,
    adAccountName: row.ad_account_name,
    selectedExplicitly: Boolean(row.selected_explicitly),
    connectedBy: row.connected_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function assetFromRow(row: MetaConnectedAssetRow): MetaConnectedAsset {
  return {
    id: row.id,
    companyId: row.company_id,
    connectionId: row.connection_id,
    assetType: row.asset_type,
    assetId: row.asset_id,
    assetName: row.asset_name,
    parentAssetId: row.parent_asset_id,
    accessToken: row.access_token,
    metadata: row.metadata ?? {},
    isSelected: Boolean(row.is_selected),
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

export async function listMetaConnectedAssets(
  companyId: string,
): Promise<MetaConnectedAsset[]> {
  requireCompanyId(companyId);
  const { data, error } = await getSupabaseServiceClient()
    .from("meta_connected_assets")
    .select("*")
    .eq("company_id", companyId)
    .order("asset_type")
    .order("asset_name", { nullsFirst: false });

  if (error) {
    throw new MetaApiError("UNKNOWN", `Falha ao consultar ativos Meta: ${error.message}`, {
      cause: error,
    });
  }

  return (data ?? []).map((row) => assetFromRow(row as MetaConnectedAssetRow));
}

export async function upsertMetaOAuthConnection(input: {
  companyId: string;
  pageId: string;
  pageName?: string | null;
  accessToken: string;
  userAccessToken?: string | null;
  tokenType?: string | null;
  expiresAt?: string | null;
  scopes?: string | null;
  metaUserId?: string | null;
  metaUserName?: string | null;
  businessId?: string | null;
  instagramBusinessId?: string | null;
  instagramUsername?: string | null;
  adAccountId?: string | null;
  adAccountName?: string | null;
  selectedExplicitly?: boolean;
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
        user_access_token: input.userAccessToken ?? null,
        token_type: input.tokenType ?? null,
        expires_at: input.expiresAt ?? null,
        scopes: input.scopes ?? null,
        meta_user_id: input.metaUserId ?? null,
        meta_user_name: input.metaUserName ?? null,
        business_id: input.businessId ?? null,
        instagram_business_id: input.instagramBusinessId ?? null,
        instagram_username: input.instagramUsername ?? null,
        ad_account_id: input.adAccountId ?? null,
        ad_account_name: input.adAccountName ?? null,
        selected_explicitly: input.selectedExplicitly ?? true,
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

export async function replaceMetaConnectedAssets(
  companyId: string,
  connectionId: string,
  assets: Array<{
    assetType: MetaAssetType;
    assetId: string;
    assetName?: string | null;
    parentAssetId?: string | null;
    accessToken?: string | null;
    metadata?: Record<string, unknown>;
  }>,
): Promise<MetaConnectedAsset[]> {
  requireCompanyId(companyId);
  const supabase = getSupabaseServiceClient();

  const { error: deleteError } = await supabase
    .from("meta_connected_assets")
    .delete()
    .eq("company_id", companyId);
  if (deleteError) {
    throw new MetaApiError("UNKNOWN", `Falha ao atualizar ativos Meta: ${deleteError.message}`, {
      cause: deleteError,
    });
  }

  if (assets.length === 0) return [];

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("meta_connected_assets")
    .insert(
      assets.map((asset) => ({
        company_id: companyId,
        connection_id: connectionId,
        asset_type: asset.assetType,
        asset_id: asset.assetId,
        asset_name: asset.assetName ?? null,
        parent_asset_id: asset.parentAssetId ?? null,
        access_token: asset.accessToken ?? null,
        metadata: asset.metadata ?? {},
        is_selected: false,
        updated_at: now,
      })),
    )
    .select("*");

  if (error) {
    throw new MetaApiError("UNKNOWN", `Falha ao salvar ativos Meta: ${error.message}`, {
      cause: error,
    });
  }

  return (data ?? []).map((row) => assetFromRow(row as MetaConnectedAssetRow));
}

export async function selectMetaConnectedAssets(input: {
  companyId: string;
  pageId: string;
  instagramBusinessId?: string | null;
  adAccountId?: string | null;
  businessId?: string | null;
}): Promise<MetaOAuthConnection> {
  requireCompanyId(input.companyId);
  const assets = await listMetaConnectedAssets(input.companyId);
  const page = assets.find(
    (asset) => asset.assetType === "facebook_page" && asset.assetId === input.pageId,
  );
  if (!page?.accessToken) {
    throw new MetaApiError("PAGE_NOT_FOUND", "A Página escolhida não pertence à autorização Meta atual.");
  }

  const instagram = input.instagramBusinessId
    ? assets.find(
        (asset) =>
          asset.assetType === "instagram_account" &&
          asset.assetId === input.instagramBusinessId &&
          (!asset.parentAssetId || asset.parentAssetId === page.assetId),
      )
    : assets.find(
        (asset) => asset.assetType === "instagram_account" && asset.parentAssetId === page.assetId,
      );
  if (input.instagramBusinessId && !instagram) {
    throw new MetaApiError("INSTAGRAM_NOT_LINKED", "A conta Instagram escolhida não está ligada à Página selecionada.");
  }

  const adAccount = input.adAccountId
    ? assets.find(
        (asset) => asset.assetType === "ad_account" && asset.assetId === input.adAccountId,
      )
    : undefined;
  if (input.adAccountId && !adAccount) {
    throw new MetaApiError("AUTH_ERROR", "A conta de anúncios escolhida não pertence à autorização Meta atual.");
  }

  const business = input.businessId
    ? assets.find(
        (asset) => asset.assetType === "business" && asset.assetId === input.businessId,
      )
    : undefined;
  if (input.businessId && !business) {
    throw new MetaApiError("AUTH_ERROR", "O Portfólio empresarial escolhido não pertence à autorização Meta atual.");
  }

  const connection = await findMetaOAuthConnection(input.companyId);
  if (!connection) {
    throw new MetaApiError("AUTH_ERROR", "A autorização Meta precisa ser concluída antes da seleção de ativos.");
  }

  const { data, error } = await getSupabaseServiceClient()
    .from("meta_oauth_connections")
    .update({
      page_id: page.assetId,
      page_name: page.assetName,
      access_token: page.accessToken,
      instagram_business_id: instagram?.assetId ?? null,
      instagram_username: instagram?.assetName ?? null,
      ad_account_id: adAccount?.assetId ?? null,
      ad_account_name: adAccount?.assetName ?? null,
      business_id: business?.assetId ?? null,
      selected_explicitly: true,
      updated_at: new Date().toISOString(),
    })
    .eq("company_id", input.companyId)
    .select("*")
    .single();

  if (error) {
    throw new MetaApiError("UNKNOWN", `Falha ao selecionar ativos Meta: ${error.message}`, {
      cause: error,
    });
  }

  const supabase = getSupabaseServiceClient();
  const { error: clearError } = await supabase
    .from("meta_connected_assets")
    .update({ is_selected: false, updated_at: new Date().toISOString() })
    .eq("company_id", input.companyId);
  if (clearError) {
    throw new MetaApiError("UNKNOWN", `Falha ao atualizar seleção Meta: ${clearError.message}`, {
      cause: clearError,
    });
  }

  const selectedIds = [page.id, instagram?.id, adAccount?.id, business?.id].filter(
    (value): value is string => Boolean(value),
  );
  if (selectedIds.length > 0) {
    const { error: selectError } = await supabase
      .from("meta_connected_assets")
      .update({ is_selected: true, updated_at: new Date().toISOString() })
      .in("id", selectedIds);
    if (selectError) {
      throw new MetaApiError("UNKNOWN", `Falha ao marcar ativos Meta: ${selectError.message}`, {
        cause: selectError,
      });
    }
  }

  return fromRow(data as MetaOAuthConnectionRow);
}
