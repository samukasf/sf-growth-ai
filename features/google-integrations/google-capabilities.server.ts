import "server-only";

import {
  findGoogleOAuthConnection,
  resolveGmailAccessToken,
  resolveGoogleOAuthConfig,
} from "@/integrations/gmail";

export const GOOGLE_CAPABILITY_SCOPES = {
  gmail: "https://www.googleapis.com/auth/gmail.modify",
  calendar: "https://www.googleapis.com/auth/calendar",
  drive: "https://www.googleapis.com/auth/drive.readonly",
  contacts: "https://www.googleapis.com/auth/contacts.readonly",
  businessProfile: "https://www.googleapis.com/auth/business.manage",
  places: "https://www.googleapis.com/auth/maps-platform.places",
  geocoding: "https://www.googleapis.com/auth/maps-platform.geocode",
} as const;

export type GoogleCapabilityKey = keyof typeof GOOGLE_CAPABILITY_SCOPES;
export type GoogleConnectionHealth =
  | "healthy"
  | "reauthorization_required"
  | "not_connected"
  | "not_configured";

export type GoogleIntegrationStatus = {
  oauthConfigured: boolean;
  connected: boolean;
  tokenHealthy: boolean;
  health: GoogleConnectionHealth;
  email: string | null;
  updatedAt: string | null;
  capabilities: Record<GoogleCapabilityKey, boolean>;
  missingCapabilities: GoogleCapabilityKey[];
  reconnectRequired: boolean;
  healthMessage: string | null;
};

function normalizeScopes(scope: string | null | undefined) {
  return new Set(
    (scope ?? "")
      .split(/[\s,]+/)
      .map((value) => value.trim())
      .filter(Boolean),
  );
}

function friendlyGoogleHealthError(error: unknown) {
  const message = error instanceof Error ? error.message : "A conexão Google não respondeu.";
  if (/refresh|token|401|403|reconect|oauth|auth/i.test(message)) {
    return "A autorização Google expirou ou foi revogada. Reconecte a conta Google para restaurar Agenda, Gmail e demais recursos.";
  }
  return `A conexão Google existe, mas não pôde ser validada agora: ${message}`;
}

export async function getGoogleIntegrationStatus(
  companyId: string,
): Promise<GoogleIntegrationStatus> {
  const oauthConfigured = Boolean(resolveGoogleOAuthConfig());
  const connection = await findGoogleOAuthConnection(companyId).catch(() => null);
  const scopes = normalizeScopes(connection?.scope);
  const capabilities = Object.fromEntries(
    Object.entries(GOOGLE_CAPABILITY_SCOPES).map(([key, scope]) => [key, scopes.has(scope)]),
  ) as Record<GoogleCapabilityKey, boolean>;

  const missingCapabilities = (Object.keys(capabilities) as GoogleCapabilityKey[]).filter(
    (key) => !capabilities[key],
  );

  if (!oauthConfigured) {
    return {
      oauthConfigured: false,
      connected: Boolean(connection),
      tokenHealthy: false,
      health: "not_configured",
      email: connection?.googleEmail ?? null,
      updatedAt: connection?.updatedAt ?? null,
      capabilities,
      missingCapabilities,
      reconnectRequired: false,
      healthMessage: "Google OAuth não está configurado no servidor.",
    };
  }

  if (!connection) {
    return {
      oauthConfigured: true,
      connected: false,
      tokenHealthy: false,
      health: "not_connected",
      email: null,
      updatedAt: null,
      capabilities,
      missingCapabilities,
      reconnectRequired: true,
      healthMessage: "Nenhuma conta Google está conectada a esta empresa.",
    };
  }

  let tokenHealthy = false;
  let healthMessage: string | null = null;
  try {
    await resolveGmailAccessToken(companyId);
    tokenHealthy = true;
  } catch (error) {
    healthMessage = friendlyGoogleHealthError(error);
  }

  const reconnectRequired = !tokenHealthy || !capabilities.calendar;
  return {
    oauthConfigured: true,
    connected: tokenHealthy,
    tokenHealthy,
    health: tokenHealthy ? "healthy" : "reauthorization_required",
    email: connection.googleEmail,
    updatedAt: connection.updatedAt,
    capabilities,
    missingCapabilities,
    reconnectRequired,
    healthMessage:
      healthMessage ??
      (capabilities.calendar
        ? null
        : "A conta Google está conectada, mas falta a permissão do Google Agenda. Reconecte para conceder os scopes atuais."),
  };
}

export type GoogleBusinessAccount = {
  name: string;
  accountName: string | null;
  type: string | null;
  role: string | null;
};

export async function listGoogleBusinessAccounts(
  companyId: string,
): Promise<GoogleBusinessAccount[]> {
  const accessToken = await resolveGmailAccessToken(companyId);
  const response = await fetch(
    "https://mybusinessaccountmanagement.googleapis.com/v1/accounts?pageSize=20",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Google Business Profile indisponível (${response.status}): ${text.slice(0, 300)}`);
  }

  const payload = JSON.parse(text) as {
    accounts?: Array<{
      name?: string;
      accountName?: string;
      type?: string;
      role?: string;
    }>;
  };

  return (payload.accounts ?? [])
    .filter((account) => Boolean(account.name))
    .map((account) => ({
      name: account.name as string,
      accountName: account.accountName ?? null,
      type: account.type ?? null,
      role: account.role ?? null,
    }));
}

export type GooglePlaceSearchResult = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  googleMapsUrl: string | null;
  primaryType: string | null;
};

export async function searchGooglePlaces(
  companyId: string,
  query: string,
  maxResults = 10,
): Promise<GooglePlaceSearchResult[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  const accessToken = await resolveGmailAccessToken(companyId);
  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Goog-FieldMask": [
        "places.id",
        "places.displayName",
        "places.formattedAddress",
        "places.nationalPhoneNumber",
        "places.websiteUri",
        "places.googleMapsUri",
        "places.primaryType",
      ].join(","),
    },
    body: JSON.stringify({
      textQuery: cleanQuery,
      pageSize: Math.max(1, Math.min(20, maxResults)),
    }),
    cache: "no-store",
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Google Places indisponível (${response.status}): ${text.slice(0, 300)}`);
  }

  const payload = JSON.parse(text) as {
    places?: Array<{
      id?: string;
      displayName?: { text?: string };
      formattedAddress?: string;
      nationalPhoneNumber?: string;
      websiteUri?: string;
      googleMapsUri?: string;
      primaryType?: string;
    }>;
  };

  return (payload.places ?? [])
    .filter((place) => Boolean(place.id))
    .map((place) => ({
      id: place.id as string,
      name: place.displayName?.text ?? "Local sem nome",
      address: place.formattedAddress ?? null,
      phone: place.nationalPhoneNumber ?? null,
      website: place.websiteUri ?? null,
      googleMapsUrl: place.googleMapsUri ?? null,
      primaryType: place.primaryType ?? null,
    }));
}
