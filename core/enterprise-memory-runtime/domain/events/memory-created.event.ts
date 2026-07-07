import { createDomainEvent, type DomainEvent } from "../../shared";
import type { EnterpriseMemory } from "../entities";

export type MemoryCreatedPayload = { memory: ReturnType<EnterpriseMemory["toJSON"]> };
export type MemoryCreatedEvent = DomainEvent<MemoryCreatedPayload>;

export function createMemoryCreatedEvent(memory: EnterpriseMemory): MemoryCreatedEvent {
  return createDomainEvent({
    eventType: "MemoryCreated",
    aggregateId: memory.id,
    organizationId: memory.organizationId,
    companyId: memory.companyId,
    payload: { memory: memory.toJSON() },
  });
}
