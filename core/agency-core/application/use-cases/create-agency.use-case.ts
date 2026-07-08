import { Agency, AgencyWorkspace, createAgencyCreatedEvent } from "../../domain";
import type { CreateAgencyDto } from "../dto";
import type { AgencyCoreDependencies } from "../dependencies";

export class CreateAgencyUseCase {
  constructor(private readonly deps: AgencyCoreDependencies) {}

  async execute(dto: CreateAgencyDto) {
    const agency = Agency.create({
      organizationId: dto.organizationId,
      name: dto.name,
      slug: dto.slug,
    });

    const workspace = AgencyWorkspace.create({
      organizationId: dto.organizationId,
      agencyId: agency.id,
      name: `${agency.name} Workspace`,
      timezone: "America/Sao_Paulo",
      locale: "pt-BR",
    });

    await this.deps.repository.saveAgency(agency);
    await this.deps.eventDispatcher.publish(createAgencyCreatedEvent(agency));

    return { agency, workspace };
  }
}
