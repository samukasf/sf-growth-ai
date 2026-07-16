export type VercelDeploymentState = "ready" | "building" | "failed" | "unknown";

export type VercelDeploymentStatus = {
  configured: boolean;
  state: VercelDeploymentState;
  description: string | null;
  commitSha: string | null;
  targetUrl: string | null;
  checkedAt: string;
};
