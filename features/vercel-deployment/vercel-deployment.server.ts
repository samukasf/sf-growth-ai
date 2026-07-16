import "server-only";

import {
  parseGitHubVercelStatus,
  unconfiguredVercelStatus,
} from "./github-vercel-status";
import type { VercelDeploymentStatus } from "./vercel-deployment.types";

const REPOSITORY_PART = /^[A-Za-z0-9_.-]+$/;
const PROJECT_REPOSITORY = "samukasf/sf-growth-ai";

function repository() {
  const owner = process.env.VERCEL_GIT_REPO_OWNER?.trim();
  const name = process.env.VERCEL_GIT_REPO_SLUG?.trim();
  if (owner && name && REPOSITORY_PART.test(owner) && REPOSITORY_PART.test(name)) {
    return { owner, name };
  }

  const [fallbackOwner, fallbackName] = (
    process.env.GITHUB_REPOSITORY?.trim() || PROJECT_REPOSITORY
  ).split("/");
  if (
    fallbackOwner &&
    fallbackName &&
    REPOSITORY_PART.test(fallbackOwner) &&
    REPOSITORY_PART.test(fallbackName)
  ) {
    return { owner: fallbackOwner, name: fallbackName };
  }

  return null;
}

export async function getVercelDeploymentStatus(): Promise<VercelDeploymentStatus> {
  const repo = repository();
  if (!repo) return unconfiguredVercelStatus();

  const token = process.env.GITHUB_TOKEN?.trim();
  const response = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.name)}/commits/main/status`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      next: { revalidate: 120 },
    },
  );

  if (!response.ok) {
    throw new Error(`Monitor de deploy indisponível (GitHub ${response.status})`);
  }

  return parseGitHubVercelStatus(await response.json());
}
