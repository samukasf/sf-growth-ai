import { describe, expect, it } from "vitest";

import { SAMUEL_AUTONOMOUS_AGENTS } from "./autonomous-agent-catalog";
import { buildAutonomousImprovementReport } from "./autonomous-improvement.engine";

describe("Samuel autonomous improvement engine", () => {
  it("loads a production-sized multi-agent catalog", () => {
    expect(SAMUEL_AUTONOMOUS_AGENTS.length).toBeGreaterThanOrEqual(60);
    expect(new Set(SAMUEL_AUTONOMOUS_AGENTS.map((agent) => agent.id)).size).toBe(
      SAMUEL_AUTONOMOUS_AGENTS.length,
    );
  });

  it("builds a safe report without leaking configured secret values", () => {
    const report = buildAutonomousImprovementReport({
      now: new Date("2026-07-16T12:00:00.000Z"),
      env: {
        OPENAI_API_KEY: "sk-secret-value-that-must-not-leak",
        SUPABASE_SERVICE_ROLE_KEY: "supabase-secret",
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        RUFLO_ENABLED: "true",
        RUFLO_MCP_COMMAND: "npx ruflo@latest mcp start",
      },
    });

    const serialized = JSON.stringify(report);

    expect(report.agentCatalog.totalAgents).toBeGreaterThanOrEqual(60);
    expect(report.intelligence.providerConfigured).toBe(true);
    expect(report.intelligence.rufloBridgeConfigured).toBe(true);
    expect(report.sourceRepository.integrationMode).toBe("bridge");
    expect(serialized).not.toContain("sk-secret-value-that-must-not-leak");
    expect(serialized).not.toContain("supabase-secret");
  });

  it("prioritizes supervised PR-based autonomy over unsafe self-modification", () => {
    const report = buildAutonomousImprovementReport({
      now: new Date("2026-07-16T12:00:00.000Z"),
      env: {},
    });

    expect(report.loop.writeMode).toBe("proposal_only");
    expect(report.backlog[0]).toMatchObject({
      id: "backlog-pr-reviewed-autonomy",
      priority: "critical",
      requiresHumanApproval: true,
    });
    expect(report.performance.bottlenecks.length).toBeGreaterThan(0);
  });
});

