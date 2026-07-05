export type GoogleAnalyticsErrorCode =
  | "RATE_LIMIT"
  | "TOKEN_EXPIRED"
  | "PROPERTY_NOT_FOUND"
  | "AUTH_ERROR"
  | "NOT_CONFIGURED"
  | "NETWORK_ERROR"
  | "UNKNOWN";

export class GoogleAnalyticsApiError extends Error {
  readonly code: GoogleAnalyticsErrorCode;
  readonly status?: number;
  readonly retryAfterMs?: number;

  constructor(
    code: GoogleAnalyticsErrorCode,
    message: string,
    options?: { status?: number; retryAfterMs?: number; cause?: unknown },
  ) {
    super(message, options?.cause ? { cause: options.cause } : undefined);
    this.name = "GoogleAnalyticsApiError";
    this.code = code;
    this.status = options?.status;
    this.retryAfterMs = options?.retryAfterMs;
  }
}

export type GoogleAnalyticsClientConfig = {
  accessToken: string;
  propertyId: string;
};

export type GoogleAnalyticsConnection = {
  connected: boolean;
  propertyId: string;
  propertyName?: string;
  displayName?: string;
};

export type GoogleAnalyticsTrafficResponse = {
  users: number;
  sessions: number;
  pageViews: number;
  bounceRate: number;
  avgSessionDuration: number;
  trend: "up" | "down" | "stable";
  trendPercent: number;
};

export type GoogleAnalyticsUsersResponse = {
  activeUsers: number;
  totalUsers: number;
  newUsers: number;
  returningUsers: number;
};

export type GoogleAnalyticsSessionsResponse = {
  sessions: number;
  engagedSessions: number;
  engagementRate: number;
  avgSessionDuration: number;
  sessionsPerUser: number;
};

export type GoogleAnalyticsConversionsResponse = {
  conversions: number;
  conversionRate: number;
  totalRevenue: number;
  purchaseConversions: number;
};

export type GoogleAnalyticsRealtimeResponse = {
  activeUsers: number;
  pageViews: number;
  events: number;
};

export type GoogleAnalyticsDimensionRow = {
  name: string;
  value: number;
  share: number;
};

export type GoogleAnalyticsTopPagesResponse = {
  pages: GoogleAnalyticsDimensionRow[];
};

export type GoogleAnalyticsChannelsResponse = {
  channels: GoogleAnalyticsDimensionRow[];
};

export type GoogleAnalyticsDevicesResponse = {
  devices: GoogleAnalyticsDimensionRow[];
};

export type GoogleAnalyticsCountriesResponse = {
  countries: GoogleAnalyticsDimensionRow[];
};

export type GoogleAnalyticsEventsResponse = {
  events: GoogleAnalyticsDimensionRow[];
};

export type GoogleAnalyticsApiSnapshot = {
  traffic: GoogleAnalyticsTrafficResponse;
  users: GoogleAnalyticsUsersResponse;
  sessions: GoogleAnalyticsSessionsResponse;
  conversions: GoogleAnalyticsConversionsResponse;
  realtime: GoogleAnalyticsRealtimeResponse;
  topPages: GoogleAnalyticsTopPagesResponse;
  channels: GoogleAnalyticsChannelsResponse;
  devices: GoogleAnalyticsDevicesResponse;
  countries: GoogleAnalyticsCountriesResponse;
  events: GoogleAnalyticsEventsResponse;
};

export type GaRunReportResponse = {
  rows?: Array<{
    dimensionValues?: Array<{ value?: string }>;
    metricValues?: Array<{ value?: string }>;
  }>;
  totals?: Array<{
    metricValues?: Array<{ value?: string }>;
  }>;
  rowCount?: number;
};
