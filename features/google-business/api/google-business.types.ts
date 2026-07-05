export type GoogleBusinessErrorCode =
  | "RATE_LIMIT"
  | "TOKEN_EXPIRED"
  | "BUSINESS_NOT_FOUND"
  | "INSUFFICIENT_PERMISSIONS"
  | "NOT_CONFIGURED"
  | "NETWORK_ERROR"
  | "UNKNOWN";

export class GoogleBusinessApiError extends Error {
  readonly code: GoogleBusinessErrorCode;
  readonly status?: number;
  readonly retryAfterMs?: number;

  constructor(
    code: GoogleBusinessErrorCode,
    message: string,
    options?: { status?: number; retryAfterMs?: number; cause?: unknown },
  ) {
    super(message, options?.cause ? { cause: options.cause } : undefined);
    this.name = "GoogleBusinessApiError";
    this.code = code;
    this.status = options?.status;
    this.retryAfterMs = options?.retryAfterMs;
  }
}

export type GoogleBusinessClientConfig = {
  accessToken: string;
  locationName: string;
  accountName?: string;
};

export type GoogleBusinessConnection = {
  connected: boolean;
  locationName: string;
  accountName?: string;
  locationTitle?: string;
};

export type GoogleBusinessProfile = {
  name: string;
  title: string;
  description?: string;
  websiteUri?: string;
  phoneNumbers?: string[];
  address?: string;
  profileCompleteness: number;
  categories?: string[];
};

export type GoogleBusinessReview = {
  id: string;
  rating: number;
  comment?: string;
  hasReply: boolean;
  createTime?: string;
  reviewerName?: string;
};

export type GoogleBusinessReviewsResponse = {
  reviews: GoogleBusinessReview[];
  averageRating: number;
  totalReviewCount: number;
  unansweredCount: number;
};

export type GoogleBusinessInsightMetric = {
  metric: string;
  value: number;
};

export type GoogleBusinessInsightsResponse = {
  metrics: GoogleBusinessInsightMetric[];
  periodStart?: string;
  periodEnd?: string;
};

export type GoogleBusinessPhoto = {
  id: string;
  name: string;
  category?: string;
  viewCount?: number;
};

export type GoogleBusinessPhotosResponse = {
  photos: GoogleBusinessPhoto[];
  totalPhotoViews: number;
};

export type GoogleBusinessPerformanceResponse = {
  searchAppearances: number;
  directionRequests: number;
  calls: number;
  websiteClicks: number;
  photoViews: number;
  mapsImpressions: number;
  rankingPosition: string;
};

export type GoogleBusinessApiSnapshot = {
  profile: GoogleBusinessProfile;
  reviews: GoogleBusinessReviewsResponse;
  insights: GoogleBusinessInsightsResponse;
  photos: GoogleBusinessPhotosResponse;
  performance: GoogleBusinessPerformanceResponse;
};
