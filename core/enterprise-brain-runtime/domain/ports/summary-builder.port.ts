import type { EnterpriseBrainSummary } from "../entities";
import type { DataSourceContribution } from "./brain-repository.port";

export interface EnterpriseBrainSummaryBuilder {
  buildForDomain(domain: string, contribution: DataSourceContribution | null): EnterpriseBrainSummary;
  buildAll(contributions: DataSourceContribution[]): {
    memory: EnterpriseBrainSummary;
    knowledge: EnterpriseBrainSummary;
    learning: EnterpriseBrainSummary;
    experience: EnterpriseBrainSummary;
    wisdom: EnterpriseBrainSummary;
    organization: EnterpriseBrainSummary;
  };
}
