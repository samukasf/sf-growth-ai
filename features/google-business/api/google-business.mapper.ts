import type { GoogleBusinessMetrics } from "../services/google-business-executive.service";
import type { GoogleBusinessApiSnapshot } from "./google-business.types";

export function mapSnapshotToMetrics(
  snapshot: GoogleBusinessApiSnapshot,
): GoogleBusinessMetrics {
  const { profile, reviews, performance, photos } = snapshot;

  const photoViews = Math.max(performance.photoViews, photos.totalPhotoViews);

  return {
    totalReviews: reviews.totalReviewCount,
    averageRating: roundRating(reviews.averageRating),
    unansweredReviews: reviews.unansweredCount,
    directionRequests: performance.directionRequests,
    calls: performance.calls,
    websiteClicks: performance.websiteClicks,
    photoViews,
    searchAppearances: performance.searchAppearances,
    rankingPosition: performance.rankingPosition,
    profileCompleteness: profile.profileCompleteness,
  };
}

function roundRating(value: number): number {
  return Math.round(value * 10) / 10;
}
