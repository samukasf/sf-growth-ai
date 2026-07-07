import type { DecisionAuthority, OrganizationMember } from "../entities";

export type ApprovalRequest = {
  requestId: string;
  memberId: string;
  organizationId: string;
  amount: number;
  currency: string;
  description: string;
};

export interface DecisionAuthorityEngine {
  resolveAuthority(member: OrganizationMember): DecisionAuthority;
  canApprove(member: OrganizationMember, amount: number): boolean;
  findRequiredApprover(
    organizationId: string,
    amount: number,
  ): Promise<OrganizationMember | null>;
}
