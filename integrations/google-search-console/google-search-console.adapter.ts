import type { MarketingExecutive } from "@/features/marketing/services/marketing-executive.service";
import type { ExecutiveIntelligence } from "@/features/samuel-ai/services/executive-intelligence.service";
import type { ExecutiveStrategy } from "@/features/samuel-ai/services/executive-strategy.service";
import type { ExecutiveCompetitor } from "@/features/samuel-ai/services/executive-competitor.service";

import {
  buildSearchConsoleExecutive,
  type SearchConsoleExecutive,
  type SearchConsoleMetrics,
} from "@/features/search-console/services/search-console-executive.service";
import {
  GoogleSearchConsoleClient,
  resolveGoogleSearchConsoleSiteUrl,
} from "./google-search-console.client";
import { mapSnapshotToMetrics } from "./google-search-console.mapper";
import type { GoogleSearchConsoleApiSnapshot } from "./google-search-console.types";
import { GoogleSearchConsoleApiError } from "./google-search-console.types";

export type SearchConsoleExecutiveEngines = {
  strategy?: ExecutiveStrategy | null;
  intelligence?: ExecutiveIntelligence | null;
  competitor?: ExecutiveCompetitor | null;
  marketingExecutive?: MarketingExecutive | null;
};

export async function fetchGoogleSearchConsoleApiSnapshot(
  companyId?: string,
): Promise<GoogleSearchConsoleApiSnapshot> {
  const siteUrl = resolveGoogleSearchConsoleSiteUrl(companyId);
  const client = new GoogleSearchConsoleClient({ siteUrl });

  const connection = await client.connect();
  if (connection.mode !== "live") {
    throw new GoogleSearchConsoleApiError(
      "NOT_CONFIGURED",
      "Search Console sem uma conexão real validada.",
    );
  }

  const [
    performance,
    queries,
    pages,
    countries,
    devices,
    indexCoverage,
    sitemaps,
    coreWebVitals,
    searchAppearance,
  ] = await Promise.all([
    client.getSearchPerformance(),
    client.getQueries(),
    client.getPages(),
    client.getCountries(),
    client.getDevices(),
    client.getIndexCoverage(),
    client.getSitemaps(),
    client.getCoreWebVitals(),
    client.getSearchAppearance(),
  ]);

  return {
    performance,
    queries,
    pages,
    countries,
    devices,
    indexCoverage,
    sitemaps,
    coreWebVitals,
    searchAppearance,
  };
}

export async function fetchSearchConsoleMetrics(
  companyId?: string,
): Promise<SearchConsoleMetrics> {
  const snapshot = await fetchGoogleSearchConsoleApiSnapshot(companyId);
  return mapSnapshotToMetrics(snapshot);
}

export async function buildSearchConsoleExecutiveForCompany(
  companyId: string,
  companyName?: string,
  engines: SearchConsoleExecutiveEngines = {},
): Promise<SearchConsoleExecutive> {
  const metrics = await fetchSearchConsoleMetrics(companyId);
  return buildSearchConsoleExecutive({
    ...engines,
    companyName,
    metrics,
  });
}

export function enrichMarketingWithSearchConsole(
  marketing: MarketingExecutive | null | undefined,
  searchConsole: SearchConsoleExecutive | null | undefined,
): MarketingExecutive | null {
  if (!marketing || !searchConsole) return marketing ?? null;

  const seoBoost = Math.min(12, Math.round(searchConsole.seoHealthScore * 0.12));

  return {
    ...marketing,
    seoScore: Math.min(100, marketing.seoScore + seoBoost),
    marketingExecutiveSummary: `${marketing.marketingExecutiveSummary} GSC: ${searchConsole.clicks.toLocaleString("pt-BR")} cliques · ${searchConsole.impressions.toLocaleString("pt-BR")} impressões · posição ${searchConsole.averagePosition}.`,
  };
}

export function enrichIntelligenceWithSearchConsole(
  intelligence: ExecutiveIntelligence | null | undefined,
  searchConsole: SearchConsoleExecutive | null | undefined,
): ExecutiveIntelligence | null {
  if (!intelligence || !searchConsole) return intelligence ?? null;

  const opportunities = searchConsole.keywordOpportunities
    .slice(0, 2)
    .map(
      (item) =>
        `Keyword "${item.query}" com ${item.impressions.toLocaleString("pt-BR")} impressões na posição ${item.position}.`,
    );

  const risks = searchConsole.searchConsoleRisks
    .filter((risk) => risk.severity === "critical" || risk.severity === "high")
    .slice(0, 1)
    .map((risk) => risk.description);

  return {
    ...intelligence,
    opportunities: [...intelligence.opportunities, ...opportunities].slice(0, 8),
    risks: [...intelligence.risks, ...risks].slice(0, 8),
    executiveSummary: `${intelligence.executiveSummary} SEO orgânico: CTR ${searchConsole.ctr}% · CWV ${searchConsole.coreWebVitalsScore}/100.`,
  };
}
