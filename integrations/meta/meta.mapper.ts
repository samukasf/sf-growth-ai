import type {
  MetaPlatformMetrics,
  MetaPostPerformance,
} from "@/features/meta/services/meta-executive.service";
import type { MetaApiSnapshot, MetaPost } from "./meta.types";

export type MetaMappedData = {
  metrics: MetaPlatformMetrics;
  bestPerformingPosts: MetaPostPerformance[];
  weakPerformingPosts: MetaPostPerformance[];
};

export function mapSnapshotToMetrics(snapshot: MetaApiSnapshot): MetaMappedData {
  const { followers, engagement, reach, impressions, roas, ctr, cpc, cpm, adsSummary } =
    snapshot;

  const metrics: MetaPlatformMetrics = {
    facebookFollowers: followers.facebookFollowers,
    instagramFollowers: followers.instagramFollowers,
    facebookEngagementRate: engagement.facebookEngagementRate,
    instagramEngagementRate: engagement.instagramEngagementRate,
    facebookReach: reach.facebookReach,
    instagramReach: reach.instagramReach,
    impressions: impressions.totalImpressions,
    reach: reach.totalReach,
    engagement: engagement.totalEngagement,
    followers: followers.totalFollowers,
    comments: engagement.comments,
    shares: engagement.shares,
    savedPosts: engagement.saves,
    followersGrowthPercent: followers.growthPercent,
    ctr: ctr.ctr,
    cpc: cpc.cpc,
    cpm: cpm.cpm,
    roas: roas.roas,
    adSpend: adsSummary.spend,
    adRevenue: adsSummary.revenue || roas.revenue,
  };

  const allPosts = [
    ...snapshot.posts.posts,
    ...snapshot.stories.stories,
    ...snapshot.reels.reels,
  ];

  const { best, weak } = partitionPosts(allPosts);

  return {
    metrics,
    bestPerformingPosts: best,
    weakPerformingPosts: weak,
  };
}

function partitionPosts(posts: MetaPost[]): {
  best: MetaPostPerformance[];
  weak: MetaPostPerformance[];
} {
  const ranked = [...posts].sort((a, b) => b.engagement - a.engagement);

  const best = ranked.slice(0, 3).map((post) => mapPostToPerformance(post));
  const weak = ranked
    .slice(-2)
    .filter((post) => post.engagement < 500)
    .map((post) => mapPostToPerformance(post, true));

  return { best, weak };
}

function mapPostToPerformance(post: MetaPost, isWeak = false): MetaPostPerformance {
  const title =
    post.message?.slice(0, 60)?.trim() ||
    `${post.platform === "instagram" ? "Instagram" : "Facebook"} ${post.type ?? "post"}`;

  const engagementRate =
    post.reach > 0 ? Math.round((post.engagement / post.reach) * 10000) / 100 : 0;

  return {
    id: post.id,
    title,
    platform: post.platform,
    engagement: post.engagement,
    reach: post.reach,
    reason: isWeak
      ? `Baixo engagement (${post.engagement}) · ER ${engagementRate}%`
      : `${post.platform === "instagram" ? "Instagram" : "Facebook"} · ER ${engagementRate}% · ${post.impressions.toLocaleString("pt-BR")} impressões`,
  };
}
