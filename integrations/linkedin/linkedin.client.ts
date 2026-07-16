import { resolveLinkedInClientConfig } from "./linkedin.auth";
import type {
  LinkedInApiSnapshot,
  LinkedInClientConfig,
  LinkedInFollowerStats,
  LinkedInOrganizationPost,
  LinkedInShareStats,
} from "./linkedin.types";
import { LinkedInApiError } from "./linkedin.types";

const LINKEDIN_API_BASE = "https://api.linkedin.com/rest";
const LINKEDIN_API_VERSION = "202401";

type LinkedInGraphResponse<T> = T & {
  message?: string;
  status?: number;
  elements?: T[];
};

function organizationUrn(organizationId: string): string {
  return `urn:li:organization:${organizationId}`;
}

export class LinkedInClient {
  private readonly config: LinkedInClientConfig;

  constructor(config: LinkedInClientConfig) {
    this.config = config;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    let response: Response;
    try {
      response = await fetch(`${LINKEDIN_API_BASE}${path}`, {
        ...init,
        headers: {
          Authorization: `Bearer ${this.config.accessToken}`,
          "LinkedIn-Version": LINKEDIN_API_VERSION,
          "X-Restli-Protocol-Version": "2.0.0",
          ...(init?.headers ?? {}),
        },
        cache: "no-store",
      });
    } catch (error) {
      throw new LinkedInApiError("NETWORK_ERROR", "Falha de rede ao contatar a LinkedIn API.", {
        cause: error,
      });
    }

    const text = await response.text();
    let parsed: LinkedInGraphResponse<T> | null = null;
    try {
      parsed = text ? (JSON.parse(text) as LinkedInGraphResponse<T>) : null;
    } catch {
      parsed = null;
    }

    if (!response.ok) {
      const message = parsed?.message ?? text;
      if (response.status === 401) {
        throw new LinkedInApiError("TOKEN_EXPIRED", "Token LinkedIn expirado ou inválido.", {
          status: response.status,
        });
      }
      if (response.status === 403) {
        throw new LinkedInApiError("AUTH_ERROR", "Permissões insuficientes na LinkedIn API.", {
          status: response.status,
        });
      }
      if (response.status === 404) {
        throw new LinkedInApiError("ORG_NOT_FOUND", "Organização LinkedIn não encontrada.", {
          status: response.status,
        });
      }
      if (response.status === 429) {
        throw new LinkedInApiError("RATE_LIMIT", "Limite de requisições da LinkedIn API atingido.", {
          status: response.status,
        });
      }
      throw new LinkedInApiError("UNKNOWN", `LinkedIn API error (${response.status}): ${message}`, {
        status: response.status,
      });
    }

    return (parsed ?? ({} as T)) as T;
  }

  async connect(): Promise<{ mode: "live"; organizationId: string }> {
    const org = await this.getOrganization();
    return { mode: "live", organizationId: org.id };
  }

  async getOrganization(): Promise<{ id: string; name: string }> {
    const data = await this.request<{ id?: number | string; localizedName?: string; name?: { localized?: Record<string, string> } }>(
      `/organizations/${this.config.organizationId}`,
    );

    const localized =
      data.localizedName ??
      (data.name?.localized ? Object.values(data.name.localized)[0] : undefined);

    return {
      id: String(data.id ?? this.config.organizationId),
      name: localized ?? `LinkedIn Org ${this.config.organizationId}`,
    };
  }

  async getFollowerStats(): Promise<LinkedInFollowerStats> {
    const urn = encodeURIComponent(organizationUrn(this.config.organizationId));
    const data = await this.request<{
      elements?: Array<{
        followerCounts?: { organicFollowerCount?: number; paidFollowerCount?: number };
        followerGains?: { organicFollowerGain?: number; paidFollowerGain?: number };
      }>;
    }>(
      `/organizationalEntityFollowerStatistics?q=organizationalEntity&organizationalEntity=${urn}`,
    );

    const element = data.elements?.[0];
    const organic = element?.followerCounts?.organicFollowerCount ?? 0;
    const paid = element?.followerCounts?.paidFollowerCount ?? 0;
    const gain =
      (element?.followerGains?.organicFollowerGain ?? 0) +
      (element?.followerGains?.paidFollowerGain ?? 0);

    return {
      organicFollowerCount: organic,
      paidFollowerCount: paid,
      followerGain: gain,
    };
  }

  async getShareStats(): Promise<LinkedInShareStats> {
    const urn = encodeURIComponent(organizationUrn(this.config.organizationId));
    const data = await this.request<{
      elements?: Array<{
        totalShareStatistics?: {
          impressionCount?: number;
          uniqueImpressionsCount?: number;
          clickCount?: number;
          likeCount?: number;
          commentCount?: number;
          shareCount?: number;
          engagement?: number;
        };
      }>;
    }>(
      `/organizationalEntityShareStatistics?q=organizationalEntity&organizationalEntity=${urn}`,
    );

    const stats = data.elements?.[0]?.totalShareStatistics ?? {};
    return {
      impressionCount: stats.impressionCount ?? 0,
      uniqueImpressionsCount: stats.uniqueImpressionsCount ?? 0,
      clickCount: stats.clickCount ?? 0,
      likeCount: stats.likeCount ?? 0,
      commentCount: stats.commentCount ?? 0,
      shareCount: stats.shareCount ?? 0,
      engagement: stats.engagement ?? 0,
    };
  }

  async getPosts(): Promise<LinkedInOrganizationPost[]> {
    const author = encodeURIComponent(organizationUrn(this.config.organizationId));
    const data = await this.request<{
      elements?: Array<{
        id?: string;
        commentary?: string;
        createdAt?: number;
        content?: { article?: { title?: string } };
      }>;
    }>(`/posts?author=${author}&q=author&count=10&sortBy=LAST_MODIFIED`);

    return (data.elements ?? []).map((post, index) => ({
      id: post.id ?? `li-post-${index}`,
      commentary:
        post.commentary?.slice(0, 120) ||
        post.content?.article?.title ||
        `Publicação ${index + 1}`,
      createdAt: post.createdAt
        ? new Date(post.createdAt).toISOString()
        : new Date().toISOString(),
      impressions: 0,
      clicks: 0,
      engagement: 0,
    }));
  }

  async fetchSnapshot(): Promise<LinkedInApiSnapshot> {
    const [organization, followers, shareStats, posts] = await Promise.all([
      this.getOrganization(),
      this.getFollowerStats(),
      this.getShareStats(),
      this.getPosts().catch(() => [] as LinkedInOrganizationPost[]),
    ]);

    return {
      organizationId: organization.id,
      organizationName: organization.name,
      followers,
      shareStats,
      posts,
      pageCompleteness: organization.name ? 90 : 60,
    };
  }
}

export function createLinkedInClient(companyId?: string): LinkedInClient {
  const config = resolveLinkedInClientConfig(undefined, companyId);
  if (!config) {
    throw new LinkedInApiError(
      "NOT_CONFIGURED",
      "Integração LinkedIn não configurada (LINKEDIN_ACCESS_TOKEN / LINKEDIN_ORG_ID).",
    );
  }
  return new LinkedInClient(config);
}
