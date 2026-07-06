import type { InnovationApprovalRequest, InnovationOpportunity } from "../entities";

export interface ApprovalRequestGenerator {
  generate(opportunity: InnovationOpportunity): InnovationApprovalRequest | null;
}
