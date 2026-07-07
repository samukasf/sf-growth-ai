import type { EnterpriseBrainSignal } from "../entities";
import type { DataSourceContribution } from "./brain-repository.port";

export interface EnterpriseBrainSignalProcessor {
  process(contributions: DataSourceContribution[]): EnterpriseBrainSignal[];
  extractRisks(signals: EnterpriseBrainSignal[]): string[];
  extractOpportunities(signals: EnterpriseBrainSignal[]): string[];
  extractPriorities(signals: EnterpriseBrainSignal[]): string[];
}
