import type { PriorityEngine, PriorityEngineInput } from "../../domain";
import type { ProjectPriorityLevel, ProjectRiskLevel } from "../../shared";
import { clampScore } from "../../shared";

export class DefaultPriorityEngine implements PriorityEngine {
  calculate(input: PriorityEngineInput): {
    priority: ProjectPriorityLevel;
    riskLevel: ProjectRiskLevel;
    businessImpact: number;
  } {
    const roi = input.roi?.estimatedROI ?? input.project.estimatedROI ?? 0;
    const investment = input.roi?.estimatedInvestment ?? input.project.estimatedInvestment ?? 1;
    const ratio = roi / Math.max(investment, 1);

    const impact = clampScore(50 + ratio * 20);
    const riskLevel: ProjectRiskLevel = ratio >= 4 ? "medium" : ratio >= 2 ? "medium" : "high";
    const priority: ProjectPriorityLevel =
      ratio >= 6 ? "strategic" : ratio >= 4 ? "critical" : ratio >= 2 ? "high" : "medium";

    return { priority, riskLevel, businessImpact: impact };
  }
}

