import type { ExecutiveIdentity, IdentityResolver, OrganizationMember } from "../../domain";
import type { OrganizationRepository } from "../../domain";

export class DefaultIdentityResolver implements IdentityResolver {
  constructor(private readonly repository: OrganizationRepository) {}

  async resolveByMemberId(memberId: string): Promise<ExecutiveIdentity | null> {
    return this.repository.findExecutiveIdentityByMemberId(memberId);
  }

  async resolveByEmail(
    email: string,
    organizationId: string,
  ): Promise<OrganizationMember | null> {
    const members = await this.repository.findMembersByOrganization(organizationId);
    return members.find((m) => m.email === email.toLowerCase()) ?? null;
  }
}
