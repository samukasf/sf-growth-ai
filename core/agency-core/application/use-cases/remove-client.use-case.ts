import { createClientRemovedEvent } from "../../domain";
import { AgencyClientNotFoundError } from "../../shared";
import type { AgencyCoreDependencies } from "../dependencies";

export class RemoveClientUseCase {
  constructor(private readonly deps: AgencyCoreDependencies) {}

  async execute(agencyId: string, clientId: string) {
    const client = await this.deps.repository.findClient(agencyId, clientId);
    if (!client) throw new AgencyClientNotFoundError(clientId);

    const archived = client.withStatus("archived");
    await this.deps.repository.removeClient(agencyId, clientId);
    await this.deps.eventDispatcher.publish(createClientRemovedEvent(archived));

    return { client: archived };
  }
}
