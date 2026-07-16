export type LinkedInApiErrorCode =
  | "NOT_CONFIGURED"
  | "AUTH_ERROR"
  | "TOKEN_EXPIRED"
  | "ORG_NOT_FOUND"
  | "RATE_LIMIT"
  | "NETWORK_ERROR"
  | "UNKNOWN";

export class LinkedInApiError extends Error {
  readonly code: LinkedInApiErrorCode;
  readonly status?: number;

  constructor(code: LinkedInApiErrorCode, message: string, options?: { status?: number; cause?: unknown }) {
    super(message, options?.cause ? { cause: options.cause } : undefined);
    this.name = "LinkedInApiError";
    this.code = code;
    this.status = options?.status;
  }
}

export type LinkedInClientConfig = {
  accessToken: string;
  organizationId: string;
};

export type LinkedInFollowerStats = {
  organicFollowerCount: number;
  paidFollowerCount: number;
  followerGain: number;
};

export type LinkedInShareStats = {
  impressionCount: number;
  uniqueImpressionsCount: number;
  clickCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  engagement: number;
};

export type LinkedInOrganizationPost = {
  id: string;
  commentary: string;
  createdAt: string;
  impressions: number;
  clicks: number;
  engagement: number;
};

export type LinkedInApiSnapshot = {
  organizationId: string;
  organizationName: string;
  followers: LinkedInFollowerStats;
  shareStats: LinkedInShareStats;
  posts: LinkedInOrganizationPost[];
  pageCompleteness: number;
};
