export type LeadDiscoveryQuery = {
  country?: string;
  region?: string;
  sector: string;
  businessType?: string;
  language?: string;
  limit?: number;
};

export type DiscoveredLead = {
  name: string;
  sourceType: string;
  sourceUrl: string;
  externalId?: string | null;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  location?: string | null;
  category?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  confidence: number;
  raw?: Record<string, unknown>;
};

export interface LeadDiscoveryProvider {
  id: string;
  configured(): boolean;
  discover(query: LeadDiscoveryQuery): Promise<DiscoveredLead[]>;
}

const textSearchUrl = "https://places.googleapis.com/v1/places:searchText";

export class GooglePlacesProvider implements LeadDiscoveryProvider {
  id = "google_places";
  configured() { return Boolean(process.env.GOOGLE_PLACES_API_KEY); }
  async discover(query: LeadDiscoveryQuery) {
    const key = process.env.GOOGLE_PLACES_API_KEY;
    if (!key) throw new Error("Google Places is not connected");
    const textQuery = [query.sector, query.businessType, query.region, query.country].filter(Boolean).join(" ");
    const response = await fetch(textSearchUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.websiteUri,places.nationalPhoneNumber,places.internationalPhoneNumber,places.googleMapsUri,places.primaryType,places.rating,places.userRatingCount",
      },
      body: JSON.stringify({ textQuery, pageSize: Math.min(Math.max(query.limit ?? 20, 1), 20), languageCode: query.language || "pt" }),
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Google Places discovery failed (${response.status})`);
    const payload = await response.json() as { places?: Array<Record<string, unknown>> };
    return (payload.places ?? []).map((p) => ({
      name: String((p.displayName as { text?: string } | undefined)?.text ?? "").trim(),
      sourceType: this.id,
      sourceUrl: String(p.googleMapsUri ?? ""),
      externalId: String(p.id ?? "") || null,
      website: typeof p.websiteUri === "string" ? p.websiteUri : null,
      phone: typeof p.internationalPhoneNumber === "string" ? p.internationalPhoneNumber : typeof p.nationalPhoneNumber === "string" ? p.nationalPhoneNumber : null,
      location: typeof p.formattedAddress === "string" ? p.formattedAddress : null,
      category: typeof p.primaryType === "string" ? p.primaryType : null,
      rating: typeof p.rating === "number" ? p.rating : null,
      reviewCount: typeof p.userRatingCount === "number" ? p.userRatingCount : null,
      confidence: p.id && p.googleMapsUri ? 0.95 : 0.75,
      raw: p,
    })).filter((lead) => lead.name && lead.sourceUrl);
  }
}

export const leadDiscoveryProviders: LeadDiscoveryProvider[] = [new GooglePlacesProvider()];
export function getLeadDiscoveryProvider(id: string) { return leadDiscoveryProviders.find((provider) => provider.id === id) ?? null; }
export function getLeadDiscoveryStatus() { return leadDiscoveryProviders.map((provider) => ({ id: provider.id, connected: provider.configured() })); }
