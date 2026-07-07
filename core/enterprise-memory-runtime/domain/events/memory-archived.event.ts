import { createDomainEvent, type DomainEvent } from "../../shared";
import type { EnterpriseMemory } from "../entities";

export type MemoryArchivedPayload = { memory: ReturnType<EnterpriseMemory["toJSON"]> };
export type MemoryArchivedEvent = DomainEvent<MemoryArchivedPayload>;

export function createMemoryArchivedEvent(memory: EnterpriseMemory): MemoryArchivedEvent {
  return createDomainEvent({
    eventType: "MemoryArchived",
    aggregateId: memory.id,
    organizationId: memory.organizationId,
    companyId: memory.companyId,
    payload: { memory: memory.toJSON() },
  });
}
