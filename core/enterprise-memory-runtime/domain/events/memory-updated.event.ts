import { createDomainEvent, type DomainEvent } from "../../shared";
import type { EnterpriseMemory } from "../entities";

export type MemoryUpdatedPayload = { memory: ReturnType<EnterpriseMemory["toJSON"]> };
export type MemoryUpdatedEvent = DomainEvent<MemoryUpdatedPayload>;

export function createMemoryUpdatedEvent(memory: EnterpriseMemory): MemoryUpdatedEvent {
  return createDomainEvent({
    eventType: "MemoryUpdated",
    aggregateId: memory.id,
    organizationId: memory.organizationId,
    companyId: memory.companyId,
    payload: { memory: memory.toJSON() },
  });
}
