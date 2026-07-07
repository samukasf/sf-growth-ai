import { createDomainEvent, type DomainEvent } from "../../shared";
import type { MemoryIndexEntry } from "../entities";

export type MemoryIndexedPayload = { indexEntry: ReturnType<MemoryIndexEntry["toJSON"]> };
export type MemoryIndexedEvent = DomainEvent<MemoryIndexedPayload>;

export function createMemoryIndexedEvent(
  indexEntry: MemoryIndexEntry,
  organizationId: string,
  companyId: string,
): MemoryIndexedEvent {
  return createDomainEvent({
    eventType: "MemoryIndexed",
    aggregateId: indexEntry.memoryId,
    organizationId,
    companyId,
    payload: { indexEntry: indexEntry.toJSON() },
  });
}
