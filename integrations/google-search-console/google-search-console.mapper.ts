import type { SearchConsoleMetrics } from "@/features/search-console/services/search-console-executive.service";
import type { GoogleSearchConsoleApiSnapshot } from "./google-search-console.types";

export function mapSnapshotToMetrics(
  snapshot: GoogleSearchConsoleApiSnapshot,
): SearchConsoleMetrics {
  const { performance, queries, pages, indexCoverage, coreWebVitals } = snapshot;

  const keywordOpportunities = queries.queries
    .filter((query) => query.impressions >= 500 && query.position > 10 && query.ctr < 5)
    .slice(0, 6)
    .map((query) => ({
      query: query.key,
      impressions: query.impressions,
      position: query.position,
      potentialClicks: Math.round(query.impressions * 0.05),
    }));

  return {
    seoHealthScore: 0,
    organicTrafficScore: 0,
    coreWebVitalsScore: coreWebVitals.overallScore,
    ctrScore: 0,
    impressions: performance.impressions,
    clicks: performance.clicks,
    averagePosition: performance.averagePosition,
    ctr: performance.ctr,
    trafficTrend: performance.trend,
    trafficTrendPercent: performance.trendPercent,
    topQueries: queries.queries.map((query) => ({
      query: query.key,
      clicks: query.clicks,
      impressions: query.impressions,
      ctr: query.ctr,
      position: query.position,
    })),
    topPages: pages.pages.map((page) => ({
      path: page.key,
      clicks: page.clicks,
      impressions: page.impressions,
      ctr: page.ctr,
      position: page.position,
    })),
    keywordOpportunities,
    indexingIssues: indexCoverage.issues.map((issue) => ({
      id: issue.id,
      type: issue.type,
      severity: issue.severity,
      affectedUrls: issue.affectedUrls,
      description: issue.description,
    })),
    indexedPages: indexCoverage.indexedPages,
    indexErrors: indexCoverage.errors,
    indexWarnings: indexCoverage.warnings,
    coreWebVitals: coreWebVitals.metrics.map((metric) => ({
      id: metric.id,
      label: metric.label,
      status: metric.status,
      value: metric.value,
      score: metric.score,
    })),
    countries: snapshot.countries.countries.map((country) => ({
      code: country.key,
      clicks: country.clicks,
      impressions: country.impressions,
    })),
    devices: snapshot.devices.devices.map((device) => ({
      device: device.key,
      clicks: device.clicks,
      impressions: device.impressions,
    })),
    sitemapsSubmitted: snapshot.sitemaps.totalSubmitted,
    searchAppearances: snapshot.searchAppearance.appearances.map((item) => ({
      appearance: item.appearance,
      clicks: item.clicks,
      impressions: item.impressions,
      ctr: item.ctr,
    })),
  };
}
