import { EnterpriseBrainContext } from "../../domain";
import type { EnterpriseBrainContextBuilder } from "../../domain/ports/context-builder.port";
import type { DataSourceContribution } from "../../domain/ports/brain-repository.port";

export class DefaultEnterpriseBrainContextBuilder implements EnterpriseBrainContextBuilder {
  async build(
    organizationId: string,
    companyId: string,
    contributions: DataSourceContribution[],
  ) {
    const businessContext: Record<string, string> = {
      organizationId,
      companyId,
      activeDomains: String(contributions.filter((c) => c.available).length),
    };

    const domainContexts: Record<string, Record<string, string>> = {};
    for (const contribution of contributions) {
      domainContexts[contribution.source] = {
        summary: contribution.summary,
        recordCount: String(contribution.recordCount),
        available: String(contribution.available),
        ...contribution.context,
      };
    }

    return EnterpriseBrainContext.create({
      organizationId,
      companyId,
      businessContext,
      domainContexts,
    });
  }
}
