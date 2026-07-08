import { ClientHealth, type HealthEngine } from "../../domain";
import type { ClientLifecycleRepository } from "../../domain";
import type { AgencyId, CompanyId, OrganizationId } from "../../shared";

export class DefaultHealthEngine implements HealthEngine {
  constructor(private readonly repository: ClientLifecycleRepository) {}

  async evaluate(
    organizationId: OrganizationId,
    agencyId: AgencyId,
    companyId: CompanyId,
  ): Promise<ClientHealth> {
    const journey = await this.repository.findJourneyByCompany(agencyId, companyId);
    const relationship = await this.repository.findRelationship(agencyId, companyId);

    const engagement = journey?.phase === "active" ? 80 : 50;
    const performance = journey?.growthScore ?? 60;
    const relationshipScore =
      relationship?.status === "healthy"
        ? 85
        : relationship?.status === "at_risk"
          ? 55
          : relationship?.status === "critical"
            ? 30
            : 70;
    const growth = journey?.growthScore ?? 50;
    const overall = Math.round((engagement + performance + relationshipScore + growth) / 4);

    const signals: string[] = [];
    if (overall < 60) signals.push("Cliente em risco");
    if (journey?.phase === "at_risk") signals.push("Fase de risco ativa");
    if (!journey?.companyBrainActive) signals.push("Company Brain inativo");

    return ClientHealth.create({
      organizationId,
      agencyId,
      companyId,
      scores: {
        overall,
        engagement,
        performance,
        relationship: relationshipScore,
        growth,
      },
      growthScore: growth,
      signals,
    });
  }
}
