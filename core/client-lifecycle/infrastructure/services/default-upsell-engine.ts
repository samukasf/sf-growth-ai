import { ClientUpsell, type UpsellEngine } from "../../domain";
import type { ClientLifecycleRepository } from "../../domain";
import type { AgencyId, CompanyId, OrganizationId } from "../../shared";

const UPSELL_CATALOG = [
  { service: "social_media", title: "Gestão de Social Media", value: 800 },
  { service: "google_business", title: "Google Business Profile", value: 400 },
  { service: "website", title: "Website / Landing Page", value: 2500 },
  { service: "software_factory", title: "Projeto Software Factory", value: 5000 },
];

export class DefaultUpsellEngine implements UpsellEngine {
  constructor(private readonly repository: ClientLifecycleRepository) {}

  async detect(
    organizationId: OrganizationId,
    agencyId: AgencyId,
    companyId: CompanyId,
  ): Promise<ClientUpsell | null> {
    const health = await this.repository.findLatestHealth(agencyId, companyId);
    if (health && health.scores.overall < 60) return null;

    const index = Math.abs(companyId.charCodeAt(0)) % UPSELL_CATALOG.length;
    const candidate = UPSELL_CATALOG[index];

    return ClientUpsell.create({
      organizationId,
      agencyId,
      companyId,
      title: candidate.title,
      service: candidate.service,
      estimatedValue: candidate.value,
    });
  }
}
