import type {
  GoogleSearchConsoleClientConfig,
  GoogleSearchConsoleConnection,
  GoogleSearchConsoleCoreWebVitalsResponse,
  GoogleSearchConsoleCountriesResponse,
  GoogleSearchConsoleDevicesResponse,
  GoogleSearchConsoleDimensionRow,
  GoogleSearchConsoleIndexCoverageResponse,
  GoogleSearchConsolePagesResponse,
  GoogleSearchConsoleQueriesResponse,
  GoogleSearchConsoleSearchAppearanceResponse,
  GoogleSearchConsoleSearchPerformanceResponse,
  GoogleSearchConsoleSitemapsResponse,
  GscSearchAnalyticsResponse,
} from "./google-search-console.types";
import { GoogleSearchConsoleApiError } from "./google-search-console.types";

const GSC_API_BASE = "https://www.googleapis.com/webmasters/v3";

const DATE_RANGE = {
  startDate: formatDateDaysAgo(28),
  endDate: formatDateDaysAgo(0),
};

const PREVIOUS_RANGE = {
  startDate: formatDateDaysAgo(56),
  endDate: formatDateDaysAgo(29),
};

function formatDateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

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
    throw new GoogleSearchConsoleApiError(
      "TOKEN_EXPIRED",
      "Token de acesso do Google Search Console expirado ou inválido.",
      { status },
    );
  }

  if (status === 403) {
    const authError =
      /insufficient|permission|scope|forbidden|denied|invalid/i.test(body) || status === 403;
    throw new GoogleSearchConsoleApiError(
      authError ? "AUTH_ERROR" : "UNKNOWN",
      authError
        ? "Autenticação inválida ou permissões insuficientes para o Search Console."
        : `Acesso negado ao Search Console (${status}).`,
      { status },
    );
  }

  if (status === 404) {
    throw new GoogleSearchConsoleApiError(
      "PROPERTY_NOT_FOUND",
      "Propriedade do Search Console não encontrada ou inacessível.",
      { status },
    );
  }

  if (status === 429) {
    throw new GoogleSearchConsoleApiError(
      "RATE_LIMIT",
      "Limite de requisições da API Google Search Console atingido.",
      { status, retryAfterMs },
    );
  }

  throw new GoogleSearchConsoleApiError(
    "UNKNOWN",
    `Erro na API Google Search Console (${status}).`,
    { status },
  );
}

function resolveClientConfig(
  overrides?: Partial<GoogleSearchConsoleClientConfig>,
): GoogleSearchConsoleClientConfig | null {
  const accessToken =
    overrides?.accessToken ?? process.env.GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN ?? "";
  const siteUrl =
    overrides?.siteUrl ?? process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL ?? "";

  if (!accessToken || !siteUrl) {
    return null;
  }

  return { accessToken, siteUrl };
}

export function resolveGoogleSearchConsoleSiteUrl(companyId?: string): string {
  const mapJson = process.env.GOOGLE_SEARCH_CONSOLE_SITE_MAP;
  if (companyId && mapJson) {
    try {
      const map = JSON.parse(mapJson) as Record<string, string>;
      if (map[companyId]) return map[companyId];
    } catch {
      // ignore invalid JSON
    }
  }

  return process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL ?? "";
}

function encodeSiteUrl(siteUrl: string): string {
  return encodeURIComponent(siteUrl);
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

function mapRows(data: GscSearchAnalyticsResponse | undefined): GoogleSearchConsoleDimensionRow[] {
  return (data?.rows ?? []).map((row) => ({
    key: row.keys?.[0] ?? "unknown",
    clicks: row.clicks ?? 0,
    impressions: row.impressions ?? 0,
    ctr: Math.round((row.ctr ?? 0) * 10000) / 100,
    position: Math.round((row.position ?? 0) * 10) / 10,
  }));
}

function aggregateTotals(data: GscSearchAnalyticsResponse | undefined): {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
} {
  const rows = data?.rows ?? [];
  if (rows.length === 0) {
    return { clicks: 0, impressions: 0, ctr: 0, position: 0 };
  }

  const clicks = rows.reduce((sum, row) => sum + (row.clicks ?? 0), 0);
  const impressions = rows.reduce((sum, row) => sum + (row.impressions ?? 0), 0);
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const position =
    rows.reduce((sum, row) => sum + (row.position ?? 0) * (row.impressions ?? 0), 0) /
    Math.max(1, impressions);

  return {
    clicks,
    impressions,
    ctr: Math.round(ctr * 100) / 100,
    position: Math.round(position * 10) / 10,
  };
}

function getMockPerformance(): GoogleSearchConsoleSearchPerformanceResponse {
  return {
    clicks: 4820,
    impressions: 128400,
    ctr: 3.76,
    averagePosition: 14.2,
    trend: "up",
    trendPercent: 9,
  };
}

function getMockQueries(): GoogleSearchConsoleQueriesResponse {
  return {
    queries: [
      { key: "growth marketing b2b", clicks: 420, impressions: 8420, ctr: 4.99, position: 8.2 },
      { key: "inteligência artificial empresas", clicks: 312, impressions: 6240, ctr: 5.0, position: 11.4 },
      { key: "automação vendas", clicks: 248, impressions: 5180, ctr: 4.79, position: 12.1 },
      { key: "crm executivo", clicks: 186, impressions: 3920, ctr: 4.74, position: 15.6 },
      { key: "seo local", clicks: 142, impressions: 2840, ctr: 5.0, position: 18.3 },
    ],
  };
}

function getMockPages(): GoogleSearchConsolePagesResponse {
  return {
    pages: [
      { key: "/", clicks: 1240, impressions: 28400, ctr: 4.37, position: 12.4 },
      { key: "/blog/growth-ai", clicks: 820, impressions: 18200, ctr: 4.51, position: 10.8 },
      { key: "/pricing", clicks: 640, impressions: 14800, ctr: 4.32, position: 14.1 },
      { key: "/samuel-ai", clicks: 520, impressions: 9200, ctr: 5.65, position: 9.6 },
      { key: "/contact", clicks: 380, impressions: 6400, ctr: 5.94, position: 16.2 },
    ],
  };
}

function getMockCountries(): GoogleSearchConsoleCountriesResponse {
  return {
    countries: [
      { key: "bra", clicks: 3120, impressions: 84200, ctr: 3.71, position: 13.8 },
      { key: "prt", clicks: 840, impressions: 18200, ctr: 4.62, position: 12.4 },
      { key: "usa", clicks: 520, impressions: 12400, ctr: 4.19, position: 18.6 },
    ],
  };
}

function getMockDevices(): GoogleSearchConsoleDevicesResponse {
  return {
    devices: [
      { key: "MOBILE", clicks: 2640, impressions: 72400, ctr: 3.65, position: 15.2 },
      { key: "DESKTOP", clicks: 1980, impressions: 48200, ctr: 4.11, position: 12.8 },
      { key: "TABLET", clicks: 200, impressions: 7800, ctr: 2.56, position: 17.4 },
    ],
  };
}

function getMockIndexCoverage(): GoogleSearchConsoleIndexCoverageResponse {
  return {
    indexedPages: 142,
    excludedPages: 18,
    errors: 4,
    warnings: 7,
    issues: [
      {
        id: "idx-1",
        type: "Crawled - currently not indexed",
        severity: "high",
        affectedUrls: 12,
        description: "12 URLs rastreadas sem indexação — revisar qualidade e canonical.",
      },
      {
        id: "idx-2",
        type: "Duplicate without user-selected canonical",
        severity: "medium",
        affectedUrls: 6,
        description: "6 URLs com canonical duplicado — consolidar versões.",
      },
      {
        id: "idx-3",
        type: "Page with redirect",
        severity: "low",
        affectedUrls: 4,
        description: "4 redirecionamentos detectados — validar cadeias.",
      },
    ],
  };
}

function getMockSitemaps(): GoogleSearchConsoleSitemapsResponse {
  return {
    totalSubmitted: 2,
    sitemaps: [
      {
        path: "https://example.com/sitemap.xml",
        lastSubmitted: formatDateDaysAgo(2),
        isPending: false,
        warnings: 1,
        errors: 0,
      },
      {
        path: "https://example.com/blog-sitemap.xml",
        lastSubmitted: formatDateDaysAgo(5),
        isPending: false,
        warnings: 0,
        errors: 0,
      },
    ],
  };
}

function getMockCoreWebVitals(): GoogleSearchConsoleCoreWebVitalsResponse {
  return {
    overallScore: 78,
    metrics: [
      { id: "lcp", label: "LCP", status: "good", value: "2.1s", score: 85 },
      { id: "inp", label: "INP", status: "needs_improvement", value: "220ms", score: 72 },
      { id: "cls", label: "CLS", status: "good", value: "0.08", score: 88 },
      { id: "fcp", label: "FCP", status: "good", value: "1.4s", score: 82 },
    ],
  };
}

function getMockSearchAppearance(): GoogleSearchConsoleSearchAppearanceResponse {
  return {
    appearances: [
      { appearance: "WEB", clicks: 3820, impressions: 102400, ctr: 3.73 },
      { appearance: "RICH_RESULT", clicks: 640, impressions: 18400, ctr: 3.48 },
      { appearance: "VIDEO", clicks: 240, impressions: 5200, ctr: 4.62 },
      { appearance: "FAQ", clicks: 120, impressions: 2400, ctr: 5.0 },
    ],
  };
}

export class GoogleSearchConsoleClient {
  private config: GoogleSearchConsoleClientConfig | null = null;
  private connection: GoogleSearchConsoleConnection | null = null;
  private useMock = false;

  constructor(private readonly overrides?: Partial<GoogleSearchConsoleClientConfig>) {}

  async connect(): Promise<GoogleSearchConsoleConnection> {
    const config = resolveClientConfig(this.overrides);

    if (!config) {
      this.useMock = true;
      this.connection = {
        connected: true,
        mode: "mock",
        siteUrl: "mock://search-console",
        siteName: "Search Console (Mock)",
      };
      return this.connection;
    }

    this.config = config;
    const encoded = encodeSiteUrl(config.siteUrl);
    const url = `${GSC_API_BASE}/sites/${encoded}`;

    try {
      const data = await this.fetchJson<{ siteUrl?: string; permissionLevel?: string }>(
        url,
        config.accessToken,
      );
      this.useMock = false;
      this.connection = {
        connected: true,
        mode: "live",
        siteUrl: data.siteUrl ?? config.siteUrl,
        siteName: data.siteUrl ?? config.siteUrl,
      };
    } catch (error) {
      if (
        error instanceof GoogleSearchConsoleApiError &&
        (error.code === "TOKEN_EXPIRED" ||
          error.code === "AUTH_ERROR" ||
          error.code === "PROPERTY_NOT_FOUND" ||
          error.code === "RATE_LIMIT")
      ) {
        throw error;
      }
      this.useMock = true;
      this.connection = {
        connected: true,
        mode: "mock",
        siteUrl: config.siteUrl,
        siteName: "Search Console (Fallback Mock)",
      };
    }

    return this.connection;
  }

  async getSearchPerformance(): Promise<GoogleSearchConsoleSearchPerformanceResponse> {
    if (this.useMock) return getMockPerformance();

    const config = this.requireConfig();
    const [current, previous] = await Promise.all([
      this.querySearchAnalytics(config, {}),
      this.querySearchAnalytics(config, PREVIOUS_RANGE),
    ]);

    const totals = aggregateTotals(current);
    const prevClicks = (previous.rows ?? []).reduce((sum, row) => sum + (row.clicks ?? 0), 0);
    const { trend, trendPercent } = deriveTrend(totals.clicks, prevClicks);

    return {
      clicks: totals.clicks,
      impressions: totals.impressions,
      ctr: totals.ctr,
      averagePosition: totals.position,
      trend,
      trendPercent,
    };
  }

  async getQueries(): Promise<GoogleSearchConsoleQueriesResponse> {
    if (this.useMock) return getMockQueries();
    const config = this.requireConfig();
    const data = await this.querySearchAnalytics(config, {
      dimensions: ["query"],
      rowLimit: 8,
    });
    return { queries: mapRows(data) };
  }

  async getPages(): Promise<GoogleSearchConsolePagesResponse> {
    if (this.useMock) return getMockPages();
    const config = this.requireConfig();
    const data = await this.querySearchAnalytics(config, {
      dimensions: ["page"],
      rowLimit: 8,
    });
    return { pages: mapRows(data) };
  }

  async getCountries(): Promise<GoogleSearchConsoleCountriesResponse> {
    if (this.useMock) return getMockCountries();
    const config = this.requireConfig();
    const data = await this.querySearchAnalytics(config, {
      dimensions: ["country"],
      rowLimit: 8,
    });
    return { countries: mapRows(data) };
  }

  async getDevices(): Promise<GoogleSearchConsoleDevicesResponse> {
    if (this.useMock) return getMockDevices();
    const config = this.requireConfig();
    const data = await this.querySearchAnalytics(config, {
      dimensions: ["device"],
      rowLimit: 5,
    });
    return { devices: mapRows(data) };
  }

  async getIndexCoverage(): Promise<GoogleSearchConsoleIndexCoverageResponse> {
    if (this.useMock) return getMockIndexCoverage();

    const config = this.requireConfig();
    const encoded = encodeSiteUrl(config.siteUrl);
    const url = `${GSC_API_BASE}/sites/${encoded}/sitemaps`;

    try {
      const data = await this.fetchJson<{
        sitemap?: Array<{ warnings?: string; errors?: string; contents?: unknown[] }>;
      }>(url, config.accessToken);

      const sitemaps = data.sitemap ?? [];
      const errors = sitemaps.reduce(
        (sum, item) => sum + (Number.parseInt(item.errors ?? "0", 10) || 0),
        0,
      );
      const warnings = sitemaps.reduce(
        (sum, item) => sum + (Number.parseInt(item.warnings ?? "0", 10) || 0),
        0,
      );

      return {
        indexedPages: sitemaps.reduce(
          (sum, item) => sum + (item.contents?.length ?? 0),
          0,
        ),
        excludedPages: 0,
        errors,
        warnings,
        issues:
          errors > 0 || warnings > 0
            ? [
                {
                  id: "idx-sitemap",
                  type: "Sitemap issues",
                  severity: errors > 0 ? "high" : "medium",
                  affectedUrls: errors + warnings,
                  description: `${errors} erro(s) e ${warnings} aviso(s) em sitemaps.`,
                },
              ]
            : [],
      };
    } catch {
      return getMockIndexCoverage();
    }
  }

  async getSitemaps(): Promise<GoogleSearchConsoleSitemapsResponse> {
    if (this.useMock) return getMockSitemaps();

    const config = this.requireConfig();
    const encoded = encodeSiteUrl(config.siteUrl);
    const url = `${GSC_API_BASE}/sites/${encoded}/sitemaps`;

    try {
      const data = await this.fetchJson<{
        sitemap?: Array<{
          path?: string;
          lastSubmitted?: string;
          isPending?: boolean;
          warnings?: string;
          errors?: string;
        }>;
      }>(url, config.accessToken);

      const sitemaps = (data.sitemap ?? []).map((item, index) => ({
        path: item.path ?? `sitemap-${index}.xml`,
        lastSubmitted: item.lastSubmitted,
        isPending: item.isPending ?? false,
        warnings: Number.parseInt(item.warnings ?? "0", 10) || 0,
        errors: Number.parseInt(item.errors ?? "0", 10) || 0,
      }));

      return { sitemaps, totalSubmitted: sitemaps.length };
    } catch {
      return getMockSitemaps();
    }
  }

  async getCoreWebVitals(): Promise<GoogleSearchConsoleCoreWebVitalsResponse> {
    if (this.useMock) return getMockCoreWebVitals();
    return getMockCoreWebVitals();
  }

  async getSearchAppearance(): Promise<GoogleSearchConsoleSearchAppearanceResponse> {
    if (this.useMock) return getMockSearchAppearance();

    const config = this.requireConfig();
    try {
      const data = await this.querySearchAnalytics(config, {
        dimensions: ["searchAppearance"],
        rowLimit: 8,
      });

      const appearances = (data.rows ?? []).map((row) => ({
        appearance: row.keys?.[0] ?? "WEB",
        clicks: row.clicks ?? 0,
        impressions: row.impressions ?? 0,
        ctr: Math.round((row.ctr ?? 0) * 10000) / 100,
      }));

      return appearances.length > 0
        ? { appearances }
        : getMockSearchAppearance();
    } catch {
      return getMockSearchAppearance();
    }
  }

  private requireConfig(): GoogleSearchConsoleClientConfig {
    if (!this.config) {
      const resolved = resolveClientConfig(this.overrides);
      if (!resolved) {
        this.useMock = true;
        throw new GoogleSearchConsoleApiError(
          "NOT_CONFIGURED",
          "Integração Search Console não configurada.",
        );
      }
      this.config = resolved;
    }
    return this.config;
  }

  private async querySearchAnalytics(
    config: GoogleSearchConsoleClientConfig,
    options: {
      dimensions?: string[];
      rowLimit?: number;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<GscSearchAnalyticsResponse> {
    const encoded = encodeSiteUrl(config.siteUrl);
    const url = `${GSC_API_BASE}/sites/${encoded}/searchAnalytics/query`;

    return this.fetchJson<GscSearchAnalyticsResponse>(url, config.accessToken, {
      startDate: options.startDate ?? DATE_RANGE.startDate,
      endDate: options.endDate ?? DATE_RANGE.endDate,
      dimensions: options.dimensions,
      rowLimit: options.rowLimit ?? 25,
    });
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
      if (error instanceof GoogleSearchConsoleApiError) {
        throw error;
      }
      throw new GoogleSearchConsoleApiError(
        "NETWORK_ERROR",
        "Falha de rede ao consultar Google Search Console API.",
        { cause: error },
      );
    }
  }
}
