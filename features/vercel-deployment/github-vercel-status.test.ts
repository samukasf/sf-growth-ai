import { describe, expect, it } from "vitest";

import { parseGitHubVercelStatus } from "./github-vercel-status";

describe("parseGitHubVercelStatus", () => {
  it("uses the latest Vercel status and ignores unrelated checks", () => {
    const status = parseGitHubVercelStatus({
      sha: "1234567890abcdef",
      statuses: [
        { context: "tests", state: "failure", updated_at: "2026-07-16T11:00:00Z" },
        { context: "Vercel", state: "pending", updated_at: "2026-07-16T10:00:00Z" },
        {
          context: "Vercel – sf-growth-ai",
          state: "success",
          description: "Deployment completed",
          target_url: "https://sf-growth-ai.vercel.app",
          updated_at: "2026-07-16T12:00:00Z",
        },
      ],
    }, "2026-07-16T12:01:00Z");

    expect(status.state).toBe("ready");
    expect(status.commitSha).toBe("1234567890ab");
    expect(status.targetUrl).toBe("https://sf-growth-ai.vercel.app/");
  });

  it("reports an actual Vercel failure", () => {
    const status = parseGitHubVercelStatus({
      sha: "abcdef",
      statuses: [{ context: "Vercel", state: "failure", description: "Build failed" }],
    });

    expect(status.state).toBe("failed");
    expect(status.description).toBe("Build failed");
  });

  it("does not turn an unrelated CI failure into a Vercel alert", () => {
    const status = parseGitHubVercelStatus({
      statuses: [{ context: "unit-tests", state: "failure" }],
    });

    expect(status.state).toBe("unknown");
  });
});
