import type { EnterpriseBrainHealth } from "../entities";
import type { DataSourceContribution } from "./brain-repository.port";

export interface EnterpriseBrainHealthAnalyzer {
  analyze(contributions: DataSourceContribution[]): EnterpriseBrainHealth;
}
