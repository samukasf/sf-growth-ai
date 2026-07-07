import { createDomainEvent, type DomainEvent } from "../../shared";
import type { MemoryVersion } from "../entities";

export type MemoryVersionedPayload = { version: ReturnType<MemoryVersion["toJSON"]> };
export type MemoryVersionedEvent = DomainEvent<MemoryVersionedPayload>;

export function createMemoryVersionedEvent(
  version: MemoryVersion,
  organizationId: string,
  companyId: string,
): MemoryVersionedEvent {
  return createDomainEvent({
    eventType: "MemoryVersioned",
    aggregateId: version.memoryId,
    organizationId,
    companyId,
    payload: { version: version.toJSON() },
  });
}
