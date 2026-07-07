import { EnterpriseBrainSummary } from "../../domain";
import type { EnterpriseBrainSummaryBuilder } from "../../domain/ports/summary-builder.port";
import type { DataSourceContribution } from "../../domain/ports/brain-repository.port";

function findContribution(contributions: DataSourceContribution[], source: string) {
  return contributions.find((c) => c.source === source) ?? null;
}

export class DefaultEnterpriseBrainSummaryBuilder implements EnterpriseBrainSummaryBuilder {
  buildForDomain(domain: string, contribution: DataSourceContribution | null) {
    if (!contribution) {
      return EnterpriseBrainSummary.create({
        domain,
        headline: `${domain} — no data`,
        highlights: [],
        recordCount: 0,
        healthScore: 0,
        lastUpdatedAt: new Date().toISOString(),
      });
    }

    return EnterpriseBrainSummary.create({
      domain,
      headline: contribution.summary,
      highlights: contribution.highlights,
      recordCount: contribution.recordCount,
      healthScore: contribution.healthScore,
      lastUpdatedAt: new Date().toISOString(),
    });
  }

  buildAll(contributions: DataSourceContribution[]) {
    return {
      memory: this.buildForDomain("memory", findContribution(contributions, "enterprise_memory")),
      knowledge: this.buildForDomain(
        "knowledge",
        findContribution(contributions, "executive_knowledge"),
      ),
      learning: this.buildForDomain(
        "learning",
        findContribution(contributions, "executive_learning"),
      ),
      experience: this.buildForDomain(
        "experience",
        findContribution(contributions, "executive_experience"),
      ),
      wisdom: this.buildForDomain("wisdom", findContribution(contributions, "executive_wisdom")),
      organization: this.buildForDomain(
        "organization",
        findContribution(contributions, "organization"),
      ),
    };
  }
}
