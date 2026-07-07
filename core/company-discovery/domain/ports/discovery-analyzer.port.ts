import type { DiscoveryFinding } from "../entities";

export type AnalyzeFindingsInput = {
  findings: DiscoveryFinding[];
  context: Record<string, unknown>;
};

export type AnalyzeFindingsResult = {
  normalizedFindings: DiscoveryFinding[];
  categoriesCovered: string[];
  averageConfidence: number;
};

export interface DiscoveryAnalyzer {
  analyze(input: AnalyzeFindingsInput): Promise<AnalyzeFindingsResult>;
}
