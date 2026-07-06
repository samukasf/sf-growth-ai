import {
  InnovationApprovalRequest,
  type ApprovalRequestGenerator,
  type InnovationOpportunity,
} from "../../domain";

export class DefaultApprovalRequestGenerator implements ApprovalRequestGenerator {
  generate(opportunity: InnovationOpportunity): InnovationApprovalRequest | null {
    if (!opportunity.requiredApproval) return null;

    return InnovationApprovalRequest.create({
      companyId: opportunity.companyId,
      opportunityId: opportunity.id,
      title: `Aprovação: ${opportunity.title}`,
      justification: `${opportunity.description} Impacto esperado: ${opportunity.expectedImpact}.`,
      estimatedCost: opportunity.estimatedCost,
      estimatedROI: opportunity.estimatedROI,
    });
  }
}
