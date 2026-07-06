import type { InnovationOpportunity, InnovationPrioritizer } from "../../domain";

function priorityScore(opportunity: InnovationOpportunity): number {
  const riskPenalty =
    opportunity.riskLevel === "critical"
      ? 30
      : opportunity.riskLevel === "high"
        ? 20
        : opportunity.riskLevel === "medium"
          ? 10
          : 0;

  return (
    opportunity.expectedImpact * 0.4 +
    opportunity.confidence * 0.3 +
    opportunity.estimatedROI * 0.0001 +
    (opportunity.requiredApproval ? 5 : 0) -
    riskPenalty
  );
}

export class DefaultInnovationPrioritizer implements InnovationPrioritizer {
  prioritize(opportunities: InnovationOpportunity[]): InnovationOpportunity[] {
    return [...opportunities].sort((a, b) => priorityScore(b) - priorityScore(a));
  }
}
