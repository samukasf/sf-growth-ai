import {
  DecisionAuthority,
  DEFAULT_APPROVAL_LIMITS,
  type DecisionAuthorityEngine,
  type OrganizationMember,
} from "../../domain";
import type { OrganizationRepository } from "../../domain";

export class DefaultDecisionAuthorityEngine implements DecisionAuthorityEngine {
  constructor(private readonly repository: OrganizationRepository) {}

  resolveAuthority(member: OrganizationMember): DecisionAuthority {
    const config = DEFAULT_APPROVAL_LIMITS.find((l) => l.accessLevel === member.role);

    return DecisionAuthority.create({
      organizationId: member.organizationId,
      memberId: member.id,
      accessLevel: member.role,
      approvalLimit: config?.unlimited ? 0 : (config?.maxAmount ?? member.approvalLimit),
      unlimited: config?.unlimited ?? false,
      currency: "EUR",
      scopes: member.permissions,
    });
  }

  canApprove(member: OrganizationMember, amount: number): boolean {
    return this.resolveAuthority(member).canApprove(amount);
  }

  async findRequiredApprover(
    organizationId: string,
    amount: number,
  ): Promise<OrganizationMember | null> {
    const members = await this.repository.findMembersByOrganization(organizationId);
    const activeMembers = members.filter((m) => m.status === "active");

    const sorted = [...DEFAULT_APPROVAL_LIMITS].sort((a, b) => b.order - a.order);

    for (const level of sorted) {
      const candidate = activeMembers.find((m) => m.role === level.accessLevel);
      if (!candidate) continue;

      if (level.unlimited || level.maxAmount >= amount) {
        return candidate;
      }
    }

    return null;
  }
}
