import type {
  LinkedInMetrics,
  LinkedInPostPerformance,
} from "@/features/linkedin/services/linkedin-executive.service";

import type { LinkedInApiSnapshot, LinkedInOrganizationPost } from "./linkedin.types";

function engagementRate(stats: LinkedInApiSnapshot["shareStats"]): number {
  if (stats.impressionCount <= 0) return 0;
  const interactions = stats.likeCount + stats.commentCount + stats.shareCount + stats.clickCount;
  return Math.round((interactions / stats.impressionCount) * 1000) / 10;
}

function followerGrowthPercent(followers: LinkedInApiSnapshot["followers"]): number {
  const total = followers.organicFollowerCount + followers.paidFollowerCount;
  if (total <= 0) return 0;
  return Math.round((followers.followerGain / total) * 1000) / 10;
}

export function mapSnapshotToMetrics(snapshot: LinkedInApiSnapshot): LinkedInMetrics {
  const followers =
    snapshot.followers.organicFollowerCount + snapshot.followers.paidFollowerCount;
  const rate = engagementRate(snapshot.shareStats);

  return {
    followers,
    followerGrowthPercent: followerGrowthPercent(snapshot.followers),
    impressions: snapshot.shareStats.impressionCount,
    reach: snapshot.shareStats.uniqueImpressionsCount,
    clicks: snapshot.shareStats.clickCount,
    profileViews: Math.round(snapshot.shareStats.uniqueImpressionsCount * 0.12),
    engagementRate: rate,
    employeeShares: snapshot.shareStats.shareCount,
    leadsGenerated: Math.round(snapshot.shareStats.clickCount * 0.08),
    pageCompleteness: snapshot.pageCompleteness,
  };
}

function toPostPerformance(
  post: LinkedInOrganizationPost,
  kind: "best" | "weak",
): LinkedInPostPerformance {
  return {
    id: post.id,
    title: post.commentary,
    format: "Post",
    engagement: post.engagement || post.clicks,
    impressions: post.impressions,
    reason:
      kind === "best"
        ? "Alta interação relativa no feed da página"
        : "Baixa interação relativa — revisar formato e CTA",
  };
}

export function mapSnapshotToPosts(snapshot: LinkedInApiSnapshot): {
  bestPosts: LinkedInPostPerformance[];
  weakPosts: LinkedInPostPerformance[];
} {
  const ranked = [...snapshot.posts].sort(
    (a, b) => (b.engagement || b.clicks) - (a.engagement || a.clicks),
  );

  if (ranked.length === 0) {
    return { bestPosts: [], weakPosts: [] };
  }

  const midpoint = Math.ceil(ranked.length / 2);
  return {
    bestPosts: ranked.slice(0, midpoint).map((post) => toPostPerformance(post, "best")),
    weakPosts: ranked.slice(midpoint).map((post) => toPostPerformance(post, "weak")),
  };
}
