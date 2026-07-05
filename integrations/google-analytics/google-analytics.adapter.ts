import type { MarketingExecutive } from "@/features/marketing/services/marketing-executive.service";
import type { ExecutiveIntelligence } from "@/features/samuel-ai/services/executive-intelligence.service";
import type { ExecutiveStrategy } from "@/features/samuel-ai/services/executive-strategy.service";
import type { ExecutiveCompetitor } from "@/features/samuel-ai/services/executive-competitor.service";

import {
  buildGoogleAnalyticsExecutive,
  type GoogleAnalyticsExecutive,
  type GoogleAnalyticsMetrics,
} from "@/features/google-analytics/services/google-analytics-executive.service";
import {
  GoogleAnalyticsClient,
  resolveGoogleAnalyticsPropertyId,
} from "./google-analytics.client";
import { mapSnapshotToMetrics } from "./google-analytics.mapper";
import type { GoogleAnalyticsApiSnapshot } from "./google-analytics.types";
import { GoogleAnalyticsApiError } from "./google-analytics.types";

export type GoogleAnalyticsExecutiveEngines = {
  strategy?: ExecutiveStrategy | null;
  intelligence?: ExecutiveIntelligence | null;
  competitor?: ExecutiveCompetitor | null;
  marketingExecutive?: MarketingExecutive | null;
};

export async function fetchGoogleAnalyticsApiSnapshot(
  companyId?: string,
): Promise<GoogleAnalyticsApiSnapshot> {
  const propertyId = resolveGoogleAnalyticsPropertyId(companyId);
  const client = new GoogleAnalyticsClient({ propertyId });

  await client.connect();

  const [
    traffic,
    users,
    sessions,
    conversions,
    realtime,
    topPages,
    channels,
    devices,
    countries,
    events,
  ] = await Promise.all([
    client.getTraffic(),
    client.getUsers(),
    client.getSessions(),
    client.getConversions(),
    client.getRealtime(),
    client.getTopPages(),
    client.getChannels(),
    client.getDevices(),
    client.getCountries(),
    client.getEvents(),
  ]);

  return {
    traffic,
    users,
    sessions,
    conversions,
    realtime,
    topPages,
    channels,
    devices,
    countries,
    events,
  };
}

export async function fetchGoogleAnalyticsMetrics(
  companyId?: string,
): Promise<GoogleAnalyticsMetrics> {
  const snapshot = await fetchGoogleAnalyticsApiSnapshot(companyId);
  return mapSnapshotToMetrics(snapshot);
}

export async function buildGoogleAnalyticsExecutiveForCompany(
  companyId: string,
  companyName?: string,
  engines: GoogleAnalyticsExecutiveEngines = {},
): Promise<GoogleAnalyticsExecutive> {
  try {
    const metrics = await fetchGoogleAnalyticsMetrics(companyId);
    return buildGoogleAnalyticsExecutive({
      ...engines,
      companyName,
      metrics,
    });
  } catch (error) {
    if (error instanceof GoogleAnalyticsApiError) {
      if (
        error.code === "NOT_CONFIGURED" ||
        error.code === "TOKEN_EXPIRED" ||
        error.code === "AUTH_ERROR" ||
        error.code === "PROPERTY_NOT_FOUND" ||
        error.code === "RATE_LIMIT"
      ) {
        return buildGoogleAnalyticsExecutive({
          ...engines,
          companyName,
        });
      }
    }

    return buildGoogleAnalyticsExecutive({
      ...engines,
      companyName,
    });
  }
}

export function enrichMarketingWithAnalytics(
  marketing: MarketingExecutive | null | undefined,
  analytics: GoogleAnalyticsExecutive | null | undefined,
): MarketingExecutive | null {
  if (!marketing || !analytics) return marketing ?? null;

  const trafficBoost = Math.min(15, Math.round(analytics.trafficScore * 0.15));
  const conversionBoost = Math.min(10, Math.round(analytics.conversionScore * 0.1));

  return {
    ...marketing,
    trafficScore: Math.min(100, marketing.trafficScore + trafficBoost),
    conversionScore: Math.min(100, marketing.conversionScore + conversionBoost),
    marketingExecutiveSummary: `${marketing.marketingExecutiveSummary} GA4: ${analytics.users.toLocaleString("pt-BR")} usuários · ${analytics.sessions.toLocaleString("pt-BR")} sessões · conversão ${analytics.conversionRate}%.`,
  };
}

export function enrichIntelligenceWithAnalytics(
  intelligence: ExecutiveIntelligence | null | undefined,
  analytics: GoogleAnalyticsExecutive | null | undefined,
): ExecutiveIntelligence | null {
  if (!intelligence || !analytics) return intelligence ?? null;

  const analyticsOpportunities = analytics.googleAnalyticsOpportunities
    .slice(0, 2)
    .map((item) => item.description);

  const analyticsRisks = analytics.googleAnalyticsRisks
    .filter((risk) => risk.severity === "critical" || risk.severity === "high")
    .slice(0, 1)
    .map((risk) => risk.description);

  return {
    ...intelligence,
    opportunities: [...intelligence.opportunities, ...analyticsOpportunities].slice(0, 8),
    risks: [...intelligence.risks, ...analyticsRisks].slice(0, 8),
    executiveSummary: `${intelligence.executiveSummary} Analytics: tráfego ${analytics.trafficTrend === "up" ? "em alta" : analytics.trafficTrend === "down" ? "em queda" : "estável"} (${analytics.trafficTrendPercent}%).`,
  };
}
