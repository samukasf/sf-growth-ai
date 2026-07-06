import { clampScore } from "../../shared";
import type {
  DecisionEvaluation,
  DecisionEvaluator,
  ExecutiveDecisionHistory,
  ExecutiveWisdom,
} from "../../domain";

const RISK_PENALTY: Record<string, number> = {
  low: 0,
  medium: 10,
  high: 25,
  critical: 40,
};

export class DefaultDecisionEvaluator implements DecisionEvaluator {
  evaluate(wisdom: ExecutiveWisdom): DecisionEvaluation {
    const readinessScore = clampScore(
      wisdom.confidence +
        wisdom.importance / 2 -
        (RISK_PENALTY[wisdom.risk] ?? 10),
    );

    const notes: string[] = [];
    if (readinessScore < 50) notes.push("Decision readiness below threshold");
    if (wisdom.roi < 0) notes.push("Negative ROI projection");

    return {
      wisdomId: wisdom.id,
      decisionTitle: wisdom.recommendation,
      readinessScore,
      riskLevel: wisdom.risk,
      expectedRoi: wisdom.roi,
      notes,
    };
  }

  evaluateHistory(history: ExecutiveDecisionHistory[]): DecisionEvaluation[] {
    return history.map((item) => ({
      wisdomId: item.wisdomId,
      decisionTitle: item.decisionTitle,
      readinessScore: item.successRate,
      riskLevel: item.outcome === "failure" ? "high" : "medium",
      expectedRoi: item.roi,
      notes: [`Historical outcome: ${item.outcome}`],
    }));
  }
}
