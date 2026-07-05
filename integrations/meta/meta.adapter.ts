import type { MarketingExecutive } from "@/features/marketing/services/marketing-executive.service";
import type { ExecutiveIntelligence } from "@/features/samuel-ai/services/executive-intelligence.service";
import type { ExecutiveStrategy } from "@/features/samuel-ai/services/executive-strategy.service";
import type { ExecutiveCompetitor } from "@/features/samuel-ai/services/executive-competitor.service";

import {
  buildMetaExecutive,
  type MetaExecutive,
} from "@/features/meta/services/meta-executive.service";
import { MetaClient } from "./meta.client";
import { resolveMetaPageId } from "./meta.auth";
import { mapSnapshotToMetrics } from "./meta.mapper";
import type { MetaApiSnapshot } from "./meta.types";
import { MetaApiError } from "./meta.types";

export type MetaExecutiveEngines = {
  strategy?: ExecutiveStrategy | null;
  intelligence?: ExecutiveIntelligence | null;
  competitor?: ExecutiveCompetitor | null;
  marketingExecutive?: MarketingExecutive | null;
};

export async function fetchMetaApiSnapshot(companyId?: string): Promise<MetaApiSnapshot> {
  const pageId = resolveMetaPageId(companyId);
  const client = new MetaClient({ pageId });

  await client.connect();

  const [
    facebookPage,
    instagramBusiness,
    posts,
    insights,
    reach,
    impressions,
    engagement,
    followers,
    stories,
    reels,
    adsSummary,
    campaigns,
    adSets,
    ads,
    roas,
    ctr,
    cpm,
    cpc,
    conversions,
  ] = await Promise.all([
    client.getFacebookPage(),
    client.getInstagramBusiness().catch((error) => {
      if (error instanceof MetaApiError && error.code === "INSTAGRAM_NOT_LINKED") {
        return {
          id: "",
          followers: 0,
          mediaCount: 0,
          linked: false,
        };
      }
      throw error;
    }),
    client.getPosts(),
    client.getInsights(),
    client.getReach(),
    client.getImpressions(),
    client.getEngagement(),
    client.getFollowers(),
    client.getStories(),
    client.getReels(),
    client.getAdsSummary(),
    client.getCampaigns(),
    client.getAdSets(),
    client.getAds(),
    client.getROAS(),
    client.getCTR(),
    client.getCPM(),
    client.getCPC(),
    client.getConversions(),
  ]);

  return {
    facebookPage,
    instagramBusiness,
    posts,
    insights,
    reach,
    impressions,
    engagement,
    followers,
    stories,
    reels,
    adsSummary,
    campaigns,
    adSets,
    ads,
    roas,
    ctr,
    cpm,
    cpc,
    conversions,
  };
}

export async function fetchMetaMetrics(companyId?: string) {
  const snapshot = await fetchMetaApiSnapshot(companyId);
  return mapSnapshotToMetrics(snapshot);
}

export async function buildMetaExecutiveForCompany(
  companyId: string,
  companyName?: string,
  engines: MetaExecutiveEngines = {},
): Promise<MetaExecutive> {
  try {
    const mapped = await fetchMetaMetrics(companyId);
    return buildMetaExecutive({
      ...engines,
      companyName,
      metrics: mapped.metrics,
      bestPerformingPosts: mapped.bestPerformingPosts,
      weakPerformingPosts: mapped.weakPerformingPosts,
    });
  } catch (error) {
    if (error instanceof MetaApiError) {
      if (
        error.code === "TOKEN_EXPIRED" ||
        error.code === "AUTH_ERROR" ||
        error.code === "PAGE_NOT_FOUND" ||
        error.code === "RATE_LIMIT" ||
        error.code === "INSTAGRAM_NOT_LINKED"
      ) {
        return buildMetaExecutive({
          ...engines,
          companyName,
        });
      }
    }

    return buildMetaExecutive({
      ...engines,
      companyName,
    });
  }
}

export function enrichMarketingWithMeta(
  marketing: MarketingExecutive | null | undefined,
  meta: MetaExecutive | null | undefined,
): MarketingExecutive | null {
  if (!marketing || !meta) return marketing ?? null;

  const socialBoost = Math.min(12, Math.round(meta.engagementScore * 0.12));
  const paidBoost = Math.min(10, Math.round(meta.paidAdsScore * 0.1));

  return {
    ...marketing,
    socialScore: Math.min(100, marketing.socialScore + socialBoost),
    paidMediaScore: Math.min(100, marketing.paidMediaScore + paidBoost),
    marketingExecutiveSummary: `${marketing.marketingExecutiveSummary} Meta: alcance ${meta.reach.toLocaleString("pt-BR")} · ROAS ${meta.roas}x · engagement ${meta.engagementScore}/100.`,
  };
}

export function enrichIntelligenceWithMeta(
  intelligence: ExecutiveIntelligence | null | undefined,
  meta: MetaExecutive | null | undefined,
): ExecutiveIntelligence | null {
  if (!intelligence || !meta) return intelligence ?? null;

  const opportunities = meta.metaOpportunities
    .slice(0, 2)
    .map((item) => item.description);

  const risks = meta.metaRisks
    .filter((risk) => risk.severity === "critical" || risk.severity === "high")
    .slice(0, 1)
    .map((risk) => risk.description);

  return {
    ...intelligence,
    opportunities: [...intelligence.opportunities, ...opportunities].slice(0, 8),
    risks: [...intelligence.risks, ...risks].slice(0, 8),
    executiveSummary: `${intelligence.executiveSummary} Meta: saúde ${meta.metaHealthScore}/100 · ROAS ${meta.roas}x.`,
  };
}
