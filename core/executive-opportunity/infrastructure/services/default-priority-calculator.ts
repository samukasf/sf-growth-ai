import { OpportunityPriority } from "../../domain";
import type {
  PriorityAnalysisInput,
  PriorityAnalysisOutput,
  PriorityCalculator,
} from "../../domain";
import type { OpportunityPriorityLevel } from "../../shared";

export class DefaultPriorityCalculator implements PriorityCalculator {
  calculate(input: PriorityAnalysisInput): PriorityAnalysisOutput {
    const { opportunity, roiScore = 0, riskScore = 50, impactScore = 50 } = input;

    const roiWeight = Math.min(100, roiScore / 3);
    const impactWeight = impactScore;
    const riskPenalty = riskScore * 0.3;
    const urgency = Math.max(0, Math.min(100, roiWeight * 0.4 + impactWeight * 0.4 - riskPenalty * 0.2));
    const strategicAlignment = Math.min(100, impactWeight * 0.6 + opportunity.confidence * 0.4);
    const score = Math.max(0, Math.min(100, urgency * 0.5 + strategicAlignment * 0.5));

    const level = this.scoreToLevel(score);

    const priority = OpportunityPriority.create({
      opportunityId: opportunity.id,
      level,
      score: Math.round(score),
      rationale: `Prioridade ${level} baseada em ROI (${Math.round(roiWeight)}), impacto (${impactScore}) e risco (${riskScore}).`,
      urgency: Math.round(urgency),
      strategicAlignment: Math.round(strategicAlignment),
    });

    return { priority, level };
  }

  private scoreToLevel(score: number): OpportunityPriorityLevel {
    if (score >= 85) return "strategic";
    if (score >= 70) return "critical";
    if (score >= 50) return "high";
    if (score >= 30) return "medium";
    return "low";
  }
}
