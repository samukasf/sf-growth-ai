import { ClientRelationship, type RelationshipManager } from "../../domain";
import type { ClientLifecycleRepository } from "../../domain";
import type { AgencyId, CompanyId, OrganizationId } from "../../shared";

export class DefaultRelationshipManager implements RelationshipManager {
  constructor(private readonly repository: ClientLifecycleRepository) {}

  async assess(
    organizationId: OrganizationId,
    agencyId: AgencyId,
    companyId: CompanyId,
  ): Promise<ClientRelationship> {
    const existing = await this.repository.findRelationship(agencyId, companyId);
    if (existing) return existing;

    const health = await this.repository.findLatestHealth(agencyId, companyId);
    const status =
      health && health.scores.overall < 60
        ? "at_risk"
        : health && health.scores.overall < 40
          ? "critical"
          : "healthy";

    return ClientRelationship.create({
      organizationId: organizationId || "org-default",
      agencyId,
      companyId,
      status,
    });
  }

  async recover(relationship: ClientRelationship): Promise<ClientRelationship> {
    return relationship.withStatus("recovered").addNote("Cliente recuperado via plano de retenção");
  }
}
