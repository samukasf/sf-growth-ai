import type {
  VercelDeploymentState,
  VercelDeploymentStatus,
} from "./vercel-deployment.types";

type GitHubCommitStatus = {
  context?: unknown;
  state?: unknown;
  description?: unknown;
  target_url?: unknown;
  updated_at?: unknown;
};

type GitHubCombinedStatus = {
  sha?: unknown;
  statuses?: unknown;
};

function compact(value: unknown, maxLength = 180) {
  if (typeof value !== "string") return null;
  const normalized = value.replace(/\s+/g, " ").trim();
  if (!normalized) return null;
  return normalized.length > maxLength
    ? `${normalized.slice(0, maxLength - 1).trimEnd()}…`
    : normalized;
}

function safeTargetUrl(value: unknown) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function deploymentState(value: unknown): VercelDeploymentState {
  switch (value) {
    case "success":
      return "ready";
    case "pending":
      return "building";
    case "failure":
    case "error":
      return "failed";
    default:
      return "unknown";
  }
}

function statusTimestamp(status: GitHubCommitStatus) {
  const timestamp = Date.parse(typeof status.updated_at === "string" ? status.updated_at : "");
  return Number.isFinite(timestamp) ? timestamp : 0;
}

export function parseGitHubVercelStatus(
  payload: unknown,
  checkedAt = new Date().toISOString(),
): VercelDeploymentStatus {
  const input = payload && typeof payload === "object"
    ? payload as GitHubCombinedStatus
    : {};
  const statuses = Array.isArray(input.statuses)
    ? input.statuses.filter((status): status is GitHubCommitStatus => Boolean(status) && typeof status === "object")
    : [];
  const vercel = statuses
    .filter((status) => compact(status.context)?.toLowerCase().includes("vercel"))
    .sort((left, right) => statusTimestamp(right) - statusTimestamp(left))[0];

  return {
    configured: true,
    state: vercel ? deploymentState(vercel.state) : "unknown",
    description: vercel ? compact(vercel.description) : null,
    commitSha: compact(input.sha, 40)?.slice(0, 12) ?? null,
    targetUrl: vercel ? safeTargetUrl(vercel.target_url) : null,
    checkedAt,
  };
}

export function unconfiguredVercelStatus(
  checkedAt = new Date().toISOString(),
): VercelDeploymentStatus {
  return {
    configured: false,
    state: "unknown",
    description: null,
    commitSha: null,
    targetUrl: null,
    checkedAt,
  };
}
