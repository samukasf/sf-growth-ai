import { ClientRenewal, type RenewalEngine } from "../../domain";
import type { ClientLifecycleRepository } from "../../domain";
import type { AgencyId, CompanyId, OrganizationId } from "../../shared";

export class DefaultRenewalEngine implements RenewalEngine {
  constructor(private readonly repository: ClientLifecycleRepository) {}

  async suggest(
    organizationId: OrganizationId,
    agencyId: AgencyId,
    companyId: CompanyId,
    contractId: string,
  ): Promise<ClientRenewal | null> {
    const health = await this.repository.findLatestHealth(agencyId, companyId);
    if (health && health.scores.overall < 50) return null;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    return ClientRenewal.create({
      organizationId,
      agencyId,
      companyId,
      contractId,
      proposedAmount: 0,
      expiresAt: expiresAt.toISOString(),
    });
  }
}
