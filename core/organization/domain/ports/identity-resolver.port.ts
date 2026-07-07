import type { ExecutiveIdentity, OrganizationMember } from "../entities";

export interface IdentityResolver {
  resolveByMemberId(memberId: string): Promise<ExecutiveIdentity | null>;
  resolveByEmail(email: string, organizationId: string): Promise<OrganizationMember | null>;
}
