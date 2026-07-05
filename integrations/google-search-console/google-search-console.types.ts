export type GoogleSearchConsoleErrorCode =
  | "RATE_LIMIT"
  | "TOKEN_EXPIRED"
  | "PROPERTY_NOT_FOUND"
  | "AUTH_ERROR"
  | "NOT_CONFIGURED"
  | "NETWORK_ERROR"
  | "UNKNOWN";

export class GoogleSearchConsoleApiError extends Error {
  readonly code: GoogleSearchConsoleErrorCode;
  readonly status?: number;
  readonly retryAfterMs?: number;

  constructor(
    code: GoogleSearchConsoleErrorCode,
    message: string,
    options?: { status?: number; retryAfterMs?: number; cause?: unknown },
  ) {
    super(message, options?.cause ? { cause: options.cause } : undefined);
    this.name = "GoogleSearchConsoleApiError";
    this.code = code;
    this.status = options?.status;
    this.retryAfterMs = options?.retryAfterMs;
  }
}

export type GoogleSearchConsoleClientConfig = {
  accessToken: string;
  siteUrl: string;
};

export type GoogleSearchConsoleConnectionMode = "live" | "mock";

export type GoogleSearchConsoleConnection = {
  connected: boolean;
  mode: GoogleSearchConsoleConnectionMode;
  siteUrl: string;
  siteName?: string;
};

export type GoogleSearchConsoleDimensionRow = {
  key: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type GoogleSearchConsoleSearchPerformanceResponse = {
  clicks: number;
  impressions: number;
  ctr: number;
  averagePosition: number;
  trend: "up" | "down" | "stable";
  trendPercent: number;
};

export type GoogleSearchConsoleQueriesResponse = {
  queries: GoogleSearchConsoleDimensionRow[];
};

export type GoogleSearchConsolePagesResponse = {
  pages: GoogleSearchConsoleDimensionRow[];
};

export type GoogleSearchConsoleCountriesResponse = {
  countries: GoogleSearchConsoleDimensionRow[];
};

export type GoogleSearchConsoleDevicesResponse = {
  devices: GoogleSearchConsoleDimensionRow[];
};

export type GoogleSearchConsoleIndexIssue = {
  id: string;
  type: string;
  severity: "critical" | "high" | "medium" | "low";
  affectedUrls: number;
  description: string;
};

export type GoogleSearchConsoleIndexCoverageResponse = {
  indexedPages: number;
  excludedPages: number;
  errors: number;
  warnings: number;
  issues: GoogleSearchConsoleIndexIssue[];
};

export type GoogleSearchConsoleSitemap = {
  path: string;
  lastSubmitted?: string;
  isPending: boolean;
  warnings: number;
  errors: number;
};

export type GoogleSearchConsoleSitemapsResponse = {
  sitemaps: GoogleSearchConsoleSitemap[];
  totalSubmitted: number;
};

export type GoogleSearchConsoleCoreWebVitalsMetric = {
  id: string;
  label: string;
  status: "good" | "needs_improvement" | "poor";
  value: string;
  score: number;
};

export type GoogleSearchConsoleCoreWebVitalsResponse = {
  overallScore: number;
  metrics: GoogleSearchConsoleCoreWebVitalsMetric[];
};

export type GoogleSearchConsoleAppearanceItem = {
  appearance: string;
  clicks: number;
  impressions: number;
  ctr: number;
};

export type GoogleSearchConsoleSearchAppearanceResponse = {
  appearances: GoogleSearchConsoleAppearanceItem[];
};

export type GoogleSearchConsoleApiSnapshot = {
  performance: GoogleSearchConsoleSearchPerformanceResponse;
  queries: GoogleSearchConsoleQueriesResponse;
  pages: GoogleSearchConsolePagesResponse;
  countries: GoogleSearchConsoleCountriesResponse;
  devices: GoogleSearchConsoleDevicesResponse;
  indexCoverage: GoogleSearchConsoleIndexCoverageResponse;
  sitemaps: GoogleSearchConsoleSitemapsResponse;
  coreWebVitals: GoogleSearchConsoleCoreWebVitalsResponse;
  searchAppearance: GoogleSearchConsoleSearchAppearanceResponse;
};

export type GscSearchAnalyticsResponse = {
  rows?: Array<{
    keys?: string[];
    clicks?: number;
    impressions?: number;
    ctr?: number;
    position?: number;
  }>;
  responseAggregationType?: string;
};
