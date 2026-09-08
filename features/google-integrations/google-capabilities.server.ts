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

export type GoogleIntegrationStatus = {
  oauthConfigured: boolean;
  connected: boolean;
  email: string | null;
  updatedAt: string | null;
  capabilities: Record<GoogleCapabilityKey, boolean>;
  missingCapabilities: GoogleCapabilityKey[];
};

function normalizeScopes(scope: string | null | undefined) {
  return new Set(
    (scope ?? "")
      .split(/[\s,]+/)
      .map((value) => value.trim())
      .filter(Boolean),
  );
}

export async function getGoogleIntegrationStatus(
  companyId: string,
): Promise<GoogleIntegrationStatus> {
  const connection = await findGoogleOAuthConnection(companyId).catch(() => null);
  const scopes = normalizeScopes(connection?.scope);
  const capabilities = Object.fromEntries(
    Object.entries(GOOGLE_CAPABILITY_SCOPES).map(([key, scope]) => [key, scopes.has(scope)]),
  ) as Record<GoogleCapabilityKey, boolean>;

  const missingCapabilities = (Object.keys(capabilities) as GoogleCapabilityKey[]).filter(
    (key) => !capabilities[key],
  );

  return {
    oauthConfigured: Boolean(resolveGoogleOAuthConfig()),
    connected: Boolean(connection),
    email: connection?.googleEmail ?? null,
    updatedAt: connection?.updatedAt ?? null,
    capabilities,
    missingCapabilities,
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
