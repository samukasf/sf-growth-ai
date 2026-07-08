import { AgencyClient, createClientAddedEvent } from "../../domain";
import type { AddClientDto } from "../dto";
import type { AgencyCoreDependencies } from "../dependencies";

export class AddClientUseCase {
  constructor(private readonly deps: AgencyCoreDependencies) {}

  async execute(dto: AddClientDto) {
    const client = AgencyClient.create({
      organizationId: dto.organizationId,
      agencyId: dto.agencyId,
      companyId: dto.companyId,
      name: dto.name,
      industry: dto.industry,
    });

    await this.deps.repository.saveClient(client);
    await this.deps.eventDispatcher.publish(createClientAddedEvent(client));
    await this.deps.coordinator.coordinateClientOnboarding(client);

    if (this.deps.enterpriseBrain.isAvailable()) {
      await this.deps.enterpriseBrain.registerAgencyClient(
        dto.organizationId,
        dto.agencyId,
        dto.companyId,
      );
    }

    if (this.deps.executiveCrm.isAvailable()) {
      await this.deps.executiveCrm.registerClientAccount(
        dto.organizationId,
        dto.agencyId,
        dto.companyId,
        dto.name,
      );
    }

    return { client };
  }
}
