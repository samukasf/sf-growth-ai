import {
  createMemoryRelationshipLinkedEvent,
} from "../../domain";
import { MemoryNotFoundError } from "../../shared";
import type { LinkMemoryRelationshipDto } from "../dto";
import type { EnterpriseMemoryRuntimeDependencies } from "../dependencies";

export class LinkMemoryRelationshipUseCase {
  constructor(private readonly deps: EnterpriseMemoryRuntimeDependencies) {}

  async execute(dto: LinkMemoryRelationshipDto) {
    const source = await this.deps.repository.findById(dto.sourceMemoryId);
    if (!source) throw new MemoryNotFoundError(dto.sourceMemoryId);

    const target = await this.deps.repository.findById(dto.targetMemoryId);
    if (!target) throw new MemoryNotFoundError(dto.targetMemoryId);

    const relationship = await this.deps.relationshipEngine.link({
      sourceMemoryId: dto.sourceMemoryId,
      targetMemoryId: dto.targetMemoryId,
      relationshipType: dto.relationshipType,
      strength: dto.strength,
    });

    const updated = source.withRelationship(relationship);
    await this.deps.repository.save(updated);

    await this.deps.eventDispatcher.publish(
      createMemoryRelationshipLinkedEvent(
        relationship,
        dto.organizationId,
        dto.companyId,
      ),
    );

    return { memory: updated, relationship };
  }
}
