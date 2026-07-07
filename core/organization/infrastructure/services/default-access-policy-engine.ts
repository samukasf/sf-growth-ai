import type { AccessCheckInput, AccessPolicyEngine } from "../../domain";
import type { OrganizationRepository } from "../../domain";
import { DEFAULT_ROLE_PERMISSIONS } from "../../domain";

export class DefaultAccessPolicyEngine implements AccessPolicyEngine {
  constructor(private readonly repository: OrganizationRepository) {}

  async canAccess(input: AccessCheckInput): Promise<boolean> {
    const member = await this.repository.findMemberById(input.memberId);
    if (!member || member.status !== "active") return false;
    if (member.organizationId !== input.organizationId) return false;

    if (member.role === "owner" || member.role === "partner" || member.role === "ceo") {
      return true;
    }

    const rolePermissions = DEFAULT_ROLE_PERMISSIONS[member.role] ?? member.permissions;
    if (!rolePermissions.includes(input.scope)) return false;

    if (input.action === "admin" || input.action === "approve") {
      return ["owner", "partner", "ceo", "director", "manager"].includes(member.role);
    }

    return true;
  }
}
