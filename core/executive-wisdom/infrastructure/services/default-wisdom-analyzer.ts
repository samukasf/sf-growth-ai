import { clampScore } from "../../shared";
import type {
  ExecutiveWisdom,
  WisdomAnalysisReport,
  WisdomAnalyzer,
} from "../../domain";

export class DefaultWisdomAnalyzer implements WisdomAnalyzer {
  analyze(wisdom: ExecutiveWisdom): WisdomAnalysisReport {
    const strengths: string[] = [];
    const risks: string[] = [];

    if (wisdom.confidence >= 70) strengths.push("High confidence wisdom");
    if (wisdom.businessImpact >= 70) strengths.push("Strong business impact");
    if (wisdom.roi > 0) strengths.push(`Positive ROI: ${wisdom.roi}`);

    if (wisdom.risk === "high" || wisdom.risk === "critical") {
      risks.push(`Elevated risk level: ${wisdom.risk}`);
    }
    if (wisdom.successRate < 50) {
      risks.push("Low historical success rate");
    }
    if (!wisdom.reasoning) {
      risks.push("Missing reasoning documentation");
    }

    const decisionReadiness = clampScore(
      (wisdom.confidence + wisdom.importance + wisdom.successRate) / 3,
    );

    return {
      wisdomId: wisdom.id,
      summary: wisdom.recommendation,
      strengths,
      risks,
      decisionReadiness,
      suggestedActions: wisdom.recommendation
        ? [wisdom.recommendation]
        : ["Define executive recommendation"],
    };
  }

  analyzeBatch(items: ExecutiveWisdom[]): WisdomAnalysisReport[] {
    return items.map((item) => this.analyze(item));
  }
}
