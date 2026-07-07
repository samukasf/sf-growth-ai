import { EnterpriseBrainHealth } from "../../domain";
import { clampScore } from "../../shared";
import type { EnterpriseBrainHealthAnalyzer } from "../../domain/ports/health-analyzer.port";
import type { DataSourceContribution } from "../../domain/ports/brain-repository.port";

export class DefaultEnterpriseBrainHealthAnalyzer implements EnterpriseBrainHealthAnalyzer {
  analyze(contributions: DataSourceContribution[]) {
    const total = contributions.length;
    const active = contributions.filter((c) => c.available).length;
    const avgHealth =
      contributions.reduce((sum, c) => sum + c.healthScore, 0) / Math.max(total, 1);

    const issues: string[] = [];
    for (const contribution of contributions) {
      if (!contribution.available) {
        issues.push(`Source unavailable: ${contribution.source}`);
      }
    }

    const overallScore = clampScore((active / Math.max(total, 1)) * 70 + avgHealth * 0.3);
    const status =
      overallScore >= 85
        ? "optimal"
        : overallScore >= 65
          ? "healthy"
          : overallScore >= 40
            ? "degraded"
            : "critical";

    return EnterpriseBrainHealth.create({
      overallScore,
      status,
      activeSources: active,
      totalSources: total,
      issues,
    });
  }
}
