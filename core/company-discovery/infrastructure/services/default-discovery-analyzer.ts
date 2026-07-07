import type {
  AnalyzeFindingsInput,
  AnalyzeFindingsResult,
  DiscoveryAnalyzer,
} from "../../domain";
import { DiscoveryFinding } from "../../domain";

export class DefaultDiscoveryAnalyzer implements DiscoveryAnalyzer {
  async analyze(input: AnalyzeFindingsInput): Promise<AnalyzeFindingsResult> {
    const seen = new Set<string>();
    const normalizedFindings: DiscoveryFinding[] = [];

    for (const finding of input.findings) {
      const dedupeKey = `${finding.category}:${finding.key}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);
      normalizedFindings.push(
        DiscoveryFinding.create({
          ...finding.toJSON(),
          confidence: Math.min(100, finding.confidence + 5),
        }),
      );
    }

    const categoriesCovered = [...new Set(normalizedFindings.map((f) => f.category))];
    const averageConfidence =
      normalizedFindings.length > 0
        ? Math.round(
            normalizedFindings.reduce((sum, f) => sum + f.confidence, 0) /
              normalizedFindings.length,
          )
        : 0;

    return { normalizedFindings, categoriesCovered, averageConfidence };
  }
}
