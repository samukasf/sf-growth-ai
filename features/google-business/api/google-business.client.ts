import type {
  GoogleBusinessClientConfig,
  GoogleBusinessConnection,
  GoogleBusinessInsightsResponse,
  GoogleBusinessPerformanceResponse,
  GoogleBusinessPhotosResponse,
  GoogleBusinessProfile,
  GoogleBusinessReviewsResponse,
} from "./google-business.types";
import { GoogleBusinessApiError } from "./google-business.types";

const BUSINESS_INFO_BASE =
  "https://mybusinessbusinessinformation.googleapis.com/v1";
const MY_BUSINESS_BASE = "https://mybusiness.googleapis.com/v4";
const PERFORMANCE_BASE =
  "https://businessprofileperformance.googleapis.com/v1";

const STAR_RATINGS: Record<string, number> = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
  STAR_RATING_UNSPECIFIED: 0,
};

function parseRetryAfterMs(header: string | null): number | undefined {
  if (!header) return undefined;
  const seconds = Number.parseInt(header, 10);
  if (!Number.isNaN(seconds)) return seconds * 1000;
  const date = Date.parse(header);
  if (!Number.isNaN(date)) return Math.max(0, date - Date.now());
  return undefined;
}

function mapHttpError(status: number, body: string, headers: Headers): never {
  const retryAfterMs = parseRetryAfterMs(headers.get("retry-after"));

  if (status === 401) {
    throw new GoogleBusinessApiError(
      "TOKEN_EXPIRED",
      "Token de acesso do Google Business expirado ou inválido.",
      { status },
    );
  }

  if (status === 403) {
    const insufficient =
      /insufficient|permission|scope|forbidden/i.test(body) || status === 403;
    throw new GoogleBusinessApiError(
      insufficient ? "INSUFFICIENT_PERMISSIONS" : "UNKNOWN",
      insufficient
        ? "Permissões insuficientes para acessar o Google Business Profile."
        : `Acesso negado ao Google Business (${status}).`,
      { status },
    );
  }

  if (status === 404) {
    throw new GoogleBusinessApiError(
      "BUSINESS_NOT_FOUND",
      "Empresa ou localização não encontrada no Google Business.",
      { status },
    );
  }

  if (status === 429) {
    throw new GoogleBusinessApiError(
      "RATE_LIMIT",
      "Limite de requisições da API Google Business atingido.",
      { status, retryAfterMs },
    );
  }

  throw new GoogleBusinessApiError(
    "UNKNOWN",
    `Erro na API Google Business (${status}).`,
    { status },
  );
}

function resolveClientConfig(
  overrides?: Partial<GoogleBusinessClientConfig>,
): GoogleBusinessClientConfig {
  const accessToken =
    overrides?.accessToken ?? process.env.GOOGLE_BUSINESS_ACCESS_TOKEN ?? "";
  const locationName =
    overrides?.locationName ?? process.env.GOOGLE_BUSINESS_LOCATION_NAME ?? "";
  const accountName =
    overrides?.accountName ?? process.env.GOOGLE_BUSINESS_ACCOUNT_NAME;

  if (!accessToken || !locationName) {
    throw new GoogleBusinessApiError(
      "NOT_CONFIGURED",
      "Integração Google Business não configurada (token ou location ausente).",
    );
  }

  return { accessToken, locationName, accountName };
}

export function resolveGoogleBusinessLocationName(companyId?: string): string {
  const mapJson = process.env.GOOGLE_BUSINESS_LOCATION_MAP;
  if (companyId && mapJson) {
    try {
      const map = JSON.parse(mapJson) as Record<string, string>;
      if (map[companyId]) return map[companyId];
    } catch {
      // ignore invalid JSON
    }
  }

  return process.env.GOOGLE_BUSINESS_LOCATION_NAME ?? "";
}

export class GoogleBusinessClient {
  private config: GoogleBusinessClientConfig | null = null;
  private connection: GoogleBusinessConnection | null = null;

  constructor(private readonly overrides?: Partial<GoogleBusinessClientConfig>) {}

  async connect(): Promise<GoogleBusinessConnection> {
    this.config = resolveClientConfig(this.overrides);
    const profile = await this.requestProfile(this.config);
    this.connection = {
      connected: true,
      locationName: this.config.locationName,
      accountName: this.config.accountName,
      locationTitle: profile.title,
    };
    return this.connection;
  }

  async getBusinessProfile(): Promise<GoogleBusinessProfile> {
    const config = this.requireConfig();
    return this.requestProfile(config);
  }

  async getReviews(): Promise<GoogleBusinessReviewsResponse> {
    const config = this.requireConfig();
    const locationId = extractLocationId(config.locationName);
    const accountSegment = config.accountName ?? "accounts/-";

    const url = `${MY_BUSINESS_BASE}/${accountSegment}/locations/${locationId}/reviews`;
    const data = await this.fetchJson<{
      reviews?: Array<{
        reviewId?: string;
        starRating?: string;
        comment?: string;
        reviewReply?: { comment?: string };
        createTime?: string;
        reviewer?: { displayName?: string };
      }>;
      averageRating?: number;
      totalReviewCount?: number;
    }>(url, config.accessToken);

    const reviews = (data.reviews ?? []).map((review, index) => ({
      id: review.reviewId ?? `review-${index}`,
      rating: STAR_RATINGS[review.starRating ?? "STAR_RATING_UNSPECIFIED"] ?? 0,
      comment: review.comment,
      hasReply: Boolean(review.reviewReply?.comment),
      createTime: review.createTime,
      reviewerName: review.reviewer?.displayName,
    }));

    const unansweredCount = reviews.filter((review) => !review.hasReply).length;
    const averageRating =
      data.averageRating ??
      (reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0);

    return {
      reviews,
      averageRating,
      totalReviewCount: data.totalReviewCount ?? reviews.length,
      unansweredCount,
    };
  }

  async getInsights(): Promise<GoogleBusinessInsightsResponse> {
    const config = this.requireConfig();
    const performance = await this.fetchPerformanceMetrics(config);
    return {
      metrics: [
        { metric: "SEARCH_APPEARANCES", value: performance.searchAppearances },
        { metric: "DIRECTION_REQUESTS", value: performance.directionRequests },
        { metric: "CALL_CLICKS", value: performance.calls },
        { metric: "WEBSITE_CLICKS", value: performance.websiteClicks },
        { metric: "PHOTO_VIEWS", value: performance.photoViews },
        { metric: "MAPS_IMPRESSIONS", value: performance.mapsImpressions },
      ],
    };
  }

  async getPhotos(): Promise<GoogleBusinessPhotosResponse> {
    const config = this.requireConfig();
    const locationId = extractLocationId(config.locationName);
    const accountSegment = config.accountName ?? "accounts/-";

    const url = `${MY_BUSINESS_BASE}/${accountSegment}/locations/${locationId}/media`;
    const data = await this.fetchJson<{
      mediaItems?: Array<{
        name?: string;
        mediaFormat?: string;
        locationAssociation?: { category?: string };
        insights?: { viewCount?: string };
      }>;
    }>(url, config.accessToken);

    const photos = (data.mediaItems ?? []).map((item, index) => ({
      id: item.name ?? `photo-${index}`,
      name: item.name ?? `photo-${index}`,
      category: item.locationAssociation?.category,
      viewCount: Number.parseInt(item.insights?.viewCount ?? "0", 10) || 0,
    }));

    const totalPhotoViews = photos.reduce(
      (sum, photo) => sum + (photo.viewCount ?? 0),
      0,
    );

    return { photos, totalPhotoViews };
  }

  async getPerformance(): Promise<GoogleBusinessPerformanceResponse> {
    const config = this.requireConfig();
    return this.fetchPerformanceMetrics(config);
  }

  private requireConfig(): GoogleBusinessClientConfig {
    if (!this.config) {
      this.config = resolveClientConfig(this.overrides);
    }
    return this.config;
  }

  private async requestProfile(
    config: GoogleBusinessClientConfig,
  ): Promise<GoogleBusinessProfile> {
    const url = `${BUSINESS_INFO_BASE}/${config.locationName}?readMask=name,title,profile,websiteUri,phoneNumbers,storefrontAddress,categories,metadata`;
    const data = await this.fetchJson<{
      name?: string;
      title?: string;
      profile?: { description?: string };
      websiteUri?: string;
      phoneNumbers?: { phoneNumber?: string }[];
      storefrontAddress?: {
        addressLines?: string[];
        locality?: string;
        administrativeArea?: string;
      };
      categories?: { displayName?: string }[];
      metadata?: { hasGoogleUpdated?: boolean; canDelete?: boolean };
    }>(url, config.accessToken);

    const completeness = calculateProfileCompleteness(data);

    return {
      name: data.name ?? config.locationName,
      title: data.title ?? "Google Business Location",
      description: data.profile?.description,
      websiteUri: data.websiteUri,
      phoneNumbers: (data.phoneNumbers ?? [])
        .map((phone) => phone.phoneNumber)
        .filter((phone): phone is string => Boolean(phone)),
      address: formatAddress(data.storefrontAddress),
      profileCompleteness: completeness,
      categories: (data.categories ?? [])
        .map((category) => category.displayName)
        .filter((category): category is string => Boolean(category)),
    };
  }

  private async fetchPerformanceMetrics(
    config: GoogleBusinessClientConfig,
  ): Promise<GoogleBusinessPerformanceResponse> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 28);

    const metrics = [
      "BUSINESS_IMPRESSIONS_DESKTOP_MAPS",
      "BUSINESS_IMPRESSIONS_MOBILE_MAPS",
      "BUSINESS_IMPRESSIONS_DESKTOP_SEARCH",
      "BUSINESS_IMPRESSIONS_MOBILE_SEARCH",
      "CALL_CLICKS",
      "WEBSITE_CLICKS",
      "BUSINESS_DIRECTION_REQUESTS",
      "PHOTOS_VIEWS_MERCHANT",
    ];

    const params = new URLSearchParams();
    for (const metric of metrics) {
      params.append("dailyMetrics", metric);
    }
    params.set(
      "dailyRange.startDate.year",
      String(startDate.getFullYear()),
    );
    params.set(
      "dailyRange.startDate.month",
      String(startDate.getMonth() + 1),
    );
    params.set("dailyRange.startDate.day", String(startDate.getDate()));
    params.set("dailyRange.endDate.year", String(endDate.getFullYear()));
    params.set("dailyRange.endDate.month", String(endDate.getMonth() + 1));
    params.set("dailyRange.endDate.day", String(endDate.getDate()));

    const url = `${PERFORMANCE_BASE}/${config.locationName}:fetchMultiDailyMetricsTimeSeries?${params.toString()}`;

    try {
      const data = await this.fetchJson<{
        multiDailyMetricTimeSeries?: Array<{
          dailyMetricTimeSeries?: Array<{
            dailyMetric?: string;
            timeSeries?: { datedValues?: Array<{ value?: string }> };
          }>;
        }>;
      }>(url, config.accessToken);

      const totals = sumPerformanceMetrics(data);
      const searchAppearances =
        totals.BUSINESS_IMPRESSIONS_DESKTOP_SEARCH +
        totals.BUSINESS_IMPRESSIONS_MOBILE_SEARCH +
        totals.BUSINESS_IMPRESSIONS_DESKTOP_MAPS +
        totals.BUSINESS_IMPRESSIONS_MOBILE_MAPS;

      const mapsImpressions =
        totals.BUSINESS_IMPRESSIONS_DESKTOP_MAPS +
        totals.BUSINESS_IMPRESSIONS_MOBILE_MAPS;

      return {
        searchAppearances,
        directionRequests: totals.BUSINESS_DIRECTION_REQUESTS,
        calls: totals.CALL_CLICKS,
        websiteClicks: totals.WEBSITE_CLICKS,
        photoViews: totals.PHOTOS_VIEWS_MERCHANT,
        mapsImpressions,
        rankingPosition: deriveRankingPosition(searchAppearances, mapsImpressions),
      };
    } catch (error) {
      if (error instanceof GoogleBusinessApiError && error.code === "NOT_CONFIGURED") {
        throw error;
      }
      return {
        searchAppearances: 0,
        directionRequests: 0,
        calls: 0,
        websiteClicks: 0,
        photoViews: 0,
        mapsImpressions: 0,
        rankingPosition: "Dados de performance indisponíveis",
      };
    }
  }

  private async fetchJson<T>(url: string, accessToken: string): Promise<T> {
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        const body = await response.text();
        mapHttpError(response.status, body, response.headers);
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof GoogleBusinessApiError) {
        throw error;
      }
      throw new GoogleBusinessApiError(
        "NETWORK_ERROR",
        "Falha de rede ao consultar Google Business API.",
        { cause: error },
      );
    }
  }
}

function extractLocationId(locationName: string): string {
  return locationName.replace(/^locations\//, "");
}

function formatAddress(address?: {
  addressLines?: string[];
  locality?: string;
  administrativeArea?: string;
}): string | undefined {
  if (!address) return undefined;
  return [
    ...(address.addressLines ?? []),
    address.locality,
    address.administrativeArea,
  ]
    .filter(Boolean)
    .join(", ");
}

function calculateProfileCompleteness(profile: {
  title?: string;
  profile?: { description?: string };
  websiteUri?: string;
  phoneNumbers?: unknown[];
  storefrontAddress?: unknown;
  categories?: unknown[];
}): number {
  const fields = [
    Boolean(profile.title),
    Boolean(profile.profile?.description),
    Boolean(profile.websiteUri),
    (profile.phoneNumbers?.length ?? 0) > 0,
    Boolean(profile.storefrontAddress),
    (profile.categories?.length ?? 0) > 0,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

function sumPerformanceMetrics(data: {
  multiDailyMetricTimeSeries?: Array<{
    dailyMetricTimeSeries?: Array<{
      dailyMetric?: string;
      timeSeries?: { datedValues?: Array<{ value?: string }> };
    }>;
  }>;
}): Record<string, number> {
  const totals: Record<string, number> = {};

  for (const series of data.multiDailyMetricTimeSeries ?? []) {
    for (const metricSeries of series.dailyMetricTimeSeries ?? []) {
      const metric = metricSeries.dailyMetric ?? "UNKNOWN";
      const sum = (metricSeries.timeSeries?.datedValues ?? []).reduce(
        (acc, entry) => acc + (Number.parseInt(entry.value ?? "0", 10) || 0),
        0,
      );
      totals[metric] = (totals[metric] ?? 0) + sum;
    }
  }

  return totals;
}

function deriveRankingPosition(
  searchAppearances: number,
  mapsImpressions: number,
): string {
  const visibility = searchAppearances + mapsImpressions;
  if (visibility >= 8000) return "#1 no Local Pack";
  if (visibility >= 4000) return "#2 no Local Pack";
  if (visibility >= 1500) return "#3 no Local Pack";
  if (visibility > 0) return "Fora do Top 3";
  return "Ranking não disponível";
}
