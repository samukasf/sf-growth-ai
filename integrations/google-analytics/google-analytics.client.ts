import type {
  GaRunReportResponse,
  GoogleAnalyticsChannelsResponse,
  GoogleAnalyticsClientConfig,
  GoogleAnalyticsConnection,
  GoogleAnalyticsConversionsResponse,
  GoogleAnalyticsCountriesResponse,
  GoogleAnalyticsDevicesResponse,
  GoogleAnalyticsEventsResponse,
  GoogleAnalyticsRealtimeResponse,
  GoogleAnalyticsSessionsResponse,
  GoogleAnalyticsTopPagesResponse,
  GoogleAnalyticsTrafficResponse,
  GoogleAnalyticsUsersResponse,
} from "./google-analytics.types";
import { GoogleAnalyticsApiError } from "./google-analytics.types";

const DATA_API_BASE = "https://analyticsdata.googleapis.com/v1beta";
const ADMIN_API_BASE = "https://analyticsadmin.googleapis.com/v1beta";

const DATE_RANGE = { startDate: "28daysAgo", endDate: "today" };
const PREVIOUS_RANGE = { startDate: "56daysAgo", endDate: "29daysAgo" };

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
    throw new GoogleAnalyticsApiError(
      "TOKEN_EXPIRED",
      "Token de acesso do Google Analytics expirado ou inválido.",
      { status },
    );
  }

  if (status === 403) {
    const authError =
      /insufficient|permission|scope|forbidden|denied/i.test(body) || status === 403;
    throw new GoogleAnalyticsApiError(
      authError ? "AUTH_ERROR" : "UNKNOWN",
      authError
        ? "Erro de autenticação ou permissões insuficientes para acessar o Google Analytics."
        : `Acesso negado ao Google Analytics (${status}).`,
      { status },
    );
  }

  if (status === 404) {
    throw new GoogleAnalyticsApiError(
      "PROPERTY_NOT_FOUND",
      "Propriedade GA4 não encontrada ou inacessível.",
      { status },
    );
  }

  if (status === 429) {
    throw new GoogleAnalyticsApiError(
      "RATE_LIMIT",
      "Limite de requisições da API Google Analytics atingido.",
      { status, retryAfterMs },
    );
  }

  throw new GoogleAnalyticsApiError(
    "UNKNOWN",
    `Erro na API Google Analytics (${status}).`,
    { status },
  );
}

function resolveClientConfig(
  overrides?: Partial<GoogleAnalyticsClientConfig>,
): GoogleAnalyticsClientConfig {
  const accessToken =
    overrides?.accessToken ?? process.env.GOOGLE_ANALYTICS_ACCESS_TOKEN ?? "";
  const propertyId =
    overrides?.propertyId ?? process.env.GOOGLE_ANALYTICS_PROPERTY_ID ?? "";

  if (!accessToken || !propertyId) {
    throw new GoogleAnalyticsApiError(
      "NOT_CONFIGURED",
      "Integração Google Analytics não configurada (token ou property ID ausente).",
    );
  }

  return { accessToken, propertyId };
}

export function resolveGoogleAnalyticsPropertyId(companyId?: string): string {
  const mapJson = process.env.GOOGLE_ANALYTICS_PROPERTY_MAP;
  if (companyId && mapJson) {
    try {
      const map = JSON.parse(mapJson) as Record<string, string>;
      if (map[companyId]) return map[companyId];
    } catch {
      // ignore invalid JSON
    }
  }

  return process.env.GOOGLE_ANALYTICS_PROPERTY_ID ?? "";
}

function toPropertyResource(propertyId: string): string {
  return propertyId.startsWith("properties/") ? propertyId : `properties/${propertyId}`;
}

function parseMetric(rows: GaRunReportResponse | undefined, index = 0): number {
  const value = rows?.totals?.[0]?.metricValues?.[index]?.value
    ?? rows?.rows?.[0]?.metricValues?.[index]?.value;
  return Number.parseFloat(value ?? "0") || 0;
}

function parseDimensionRows(
  data: GaRunReportResponse | undefined,
  dimensionIndex = 0,
  metricIndex = 0,
  limit = 8,
): Array<{ name: string; value: number; share: number }> {
  const rows = (data?.rows ?? []).slice(0, limit);
  const total = rows.reduce(
    (sum, row) => sum + (Number.parseFloat(row.metricValues?.[metricIndex]?.value ?? "0") || 0),
    0,
  );

  return rows.map((row) => {
    const value = Number.parseFloat(row.metricValues?.[metricIndex]?.value ?? "0") || 0;
    const name = row.dimensionValues?.[dimensionIndex]?.value ?? "Desconhecido";
    return {
      name,
      value,
      share: total > 0 ? Math.round((value / total) * 100) : 0,
    };
  });
}

function deriveTrend(current: number, previous: number): {
  trend: "up" | "down" | "stable";
  trendPercent: number;
} {
  if (previous <= 0) {
    return { trend: current > 0 ? "up" : "stable", trendPercent: 0 };
  }
  const change = ((current - previous) / previous) * 100;
  if (Math.abs(change) < 3) return { trend: "stable", trendPercent: Math.round(change) };
  return {
    trend: change > 0 ? "up" : "down",
    trendPercent: Math.round(Math.abs(change)),
  };
}

export class GoogleAnalyticsClient {
  private config: GoogleAnalyticsClientConfig | null = null;
  private connection: GoogleAnalyticsConnection | null = null;

  constructor(private readonly overrides?: Partial<GoogleAnalyticsClientConfig>) {}

  async connect(): Promise<GoogleAnalyticsConnection> {
    this.config = resolveClientConfig(this.overrides);
    const property = toPropertyResource(this.config.propertyId);
    const url = `${ADMIN_API_BASE}/${property}`;

    const data = await this.fetchJson<{
      name?: string;
      displayName?: string;
    }>(url, this.config.accessToken);

    this.connection = {
      connected: true,
      propertyId: this.config.propertyId,
      propertyName: data.name,
      displayName: data.displayName,
    };

    return this.connection;
  }

  async getTraffic(): Promise<GoogleAnalyticsTrafficResponse> {
    const config = this.requireConfig();
    const property = toPropertyResource(config.propertyId);

    const [current, previous] = await Promise.all([
      this.runReport(property, config.accessToken, {
        dateRanges: [DATE_RANGE],
        metrics: [
          { name: "activeUsers" },
          { name: "sessions" },
          { name: "screenPageViews" },
          { name: "bounceRate" },
          { name: "averageSessionDuration" },
        ],
      }),
      this.runReport(property, config.accessToken, {
        dateRanges: [PREVIOUS_RANGE],
        metrics: [{ name: "sessions" }],
      }),
    ]);

    const users = parseMetric(current, 0);
    const sessions = parseMetric(current, 1);
    const previousSessions = parseMetric(previous, 0);
    const { trend, trendPercent } = deriveTrend(sessions, previousSessions);

    return {
      users,
      sessions,
      pageViews: parseMetric(current, 2),
      bounceRate: Math.round(parseMetric(current, 3) * 100) / 100,
      avgSessionDuration: Math.round(parseMetric(current, 4)),
      trend,
      trendPercent,
    };
  }

  async getUsers(): Promise<GoogleAnalyticsUsersResponse> {
    const config = this.requireConfig();
    const property = toPropertyResource(config.propertyId);

    const data = await this.runReport(property, config.accessToken, {
      dateRanges: [DATE_RANGE],
      metrics: [
        { name: "activeUsers" },
        { name: "totalUsers" },
        { name: "newUsers" },
      ],
    });

    const activeUsers = parseMetric(data, 0);
    const totalUsers = parseMetric(data, 1);
    const newUsers = parseMetric(data, 2);

    return {
      activeUsers,
      totalUsers,
      newUsers,
      returningUsers: Math.max(0, totalUsers - newUsers),
    };
  }

  async getSessions(): Promise<GoogleAnalyticsSessionsResponse> {
    const config = this.requireConfig();
    const property = toPropertyResource(config.propertyId);

    const data = await this.runReport(property, config.accessToken, {
      dateRanges: [DATE_RANGE],
      metrics: [
        { name: "sessions" },
        { name: "engagedSessions" },
        { name: "engagementRate" },
        { name: "averageSessionDuration" },
        { name: "sessionsPerUser" },
      ],
    });

    return {
      sessions: parseMetric(data, 0),
      engagedSessions: parseMetric(data, 1),
      engagementRate: Math.round(parseMetric(data, 2) * 10000) / 100,
      avgSessionDuration: Math.round(parseMetric(data, 3)),
      sessionsPerUser: Math.round(parseMetric(data, 4) * 100) / 100,
    };
  }

  async getConversions(): Promise<GoogleAnalyticsConversionsResponse> {
    const config = this.requireConfig();
    const property = toPropertyResource(config.propertyId);

    const data = await this.runReport(property, config.accessToken, {
      dateRanges: [DATE_RANGE],
      metrics: [
        { name: "conversions" },
        { name: "sessionConversionRate" },
        { name: "totalRevenue" },
        { name: "ecommercePurchases" },
      ],
    });

    return {
      conversions: parseMetric(data, 0),
      conversionRate: Math.round(parseMetric(data, 1) * 10000) / 100,
      totalRevenue: parseMetric(data, 2),
      purchaseConversions: parseMetric(data, 3),
    };
  }

  async getRealtime(): Promise<GoogleAnalyticsRealtimeResponse> {
    const config = this.requireConfig();
    const property = toPropertyResource(config.propertyId);
    const url = `${DATA_API_BASE}/${property}:runRealtimeReport`;

    const data = await this.fetchJson<GaRunReportResponse>(url, config.accessToken, {
      metrics: [
        { name: "activeUsers" },
        { name: "screenPageViews" },
        { name: "eventCount" },
      ],
    });

    return {
      activeUsers: parseMetric(data, 0),
      pageViews: parseMetric(data, 1),
      events: parseMetric(data, 2),
    };
  }

  async getTopPages(): Promise<GoogleAnalyticsTopPagesResponse> {
    const config = this.requireConfig();
    const property = toPropertyResource(config.propertyId);

    const data = await this.runReport(property, config.accessToken, {
      dateRanges: [DATE_RANGE],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      orderBys: [{ desc: true, metric: { metricName: "screenPageViews" } }],
      limit: 8,
    });

    return { pages: parseDimensionRows(data) };
  }

  async getChannels(): Promise<GoogleAnalyticsChannelsResponse> {
    const config = this.requireConfig();
    const property = toPropertyResource(config.propertyId);

    const data = await this.runReport(property, config.accessToken, {
      dateRanges: [DATE_RANGE],
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ desc: true, metric: { metricName: "sessions" } }],
      limit: 8,
    });

    return { channels: parseDimensionRows(data) };
  }

  async getDevices(): Promise<GoogleAnalyticsDevicesResponse> {
    const config = this.requireConfig();
    const property = toPropertyResource(config.propertyId);

    const data = await this.runReport(property, config.accessToken, {
      dateRanges: [DATE_RANGE],
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ desc: true, metric: { metricName: "sessions" } }],
      limit: 5,
    });

    return { devices: parseDimensionRows(data) };
  }

  async getCountries(): Promise<GoogleAnalyticsCountriesResponse> {
    const config = this.requireConfig();
    const property = toPropertyResource(config.propertyId);

    const data = await this.runReport(property, config.accessToken, {
      dateRanges: [DATE_RANGE],
      dimensions: [{ name: "country" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ desc: true, metric: { metricName: "activeUsers" } }],
      limit: 8,
    });

    return { countries: parseDimensionRows(data) };
  }

  async getEvents(): Promise<GoogleAnalyticsEventsResponse> {
    const config = this.requireConfig();
    const property = toPropertyResource(config.propertyId);

    const data = await this.runReport(property, config.accessToken, {
      dateRanges: [DATE_RANGE],
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      orderBys: [{ desc: true, metric: { metricName: "eventCount" } }],
      limit: 8,
    });

    return { events: parseDimensionRows(data) };
  }

  private requireConfig(): GoogleAnalyticsClientConfig {
    if (!this.config) {
      this.config = resolveClientConfig(this.overrides);
    }
    return this.config;
  }

  private async runReport(
    property: string,
    accessToken: string,
    body: Record<string, unknown>,
  ): Promise<GaRunReportResponse> {
    const url = `${DATA_API_BASE}/${property}:runReport`;
    return this.fetchJson<GaRunReportResponse>(url, accessToken, body);
  }

  private async fetchJson<T>(
    url: string,
    accessToken: string,
    body?: Record<string, unknown>,
  ): Promise<T> {
    try {
      const response = await fetch(url, {
        method: body ? "POST" : "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
        cache: "no-store",
      });

      if (!response.ok) {
        const text = await response.text();
        mapHttpError(response.status, text, response.headers);
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof GoogleAnalyticsApiError) {
        throw error;
      }
      throw new GoogleAnalyticsApiError(
        "NETWORK_ERROR",
        "Falha de rede ao consultar Google Analytics API.",
        { cause: error },
      );
    }
  }
}
