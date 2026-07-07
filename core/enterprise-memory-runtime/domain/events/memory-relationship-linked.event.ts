import { createDomainEvent, type DomainEvent } from "../../shared";
import type { MemoryRelationship } from "../entities";

export type MemoryRelationshipLinkedPayload = {
  relationship: ReturnType<MemoryRelationship["toJSON"]>;
};
export type MemoryRelationshipLinkedEvent = DomainEvent<MemoryRelationshipLinkedPayload>;

export function createMemoryRelationshipLinkedEvent(
  relationship: MemoryRelationship,
  organizationId: string,
  companyId: string,
): MemoryRelationshipLinkedEvent {
  return createDomainEvent({
    eventType: "MemoryRelationshipLinked",
    aggregateId: relationship.sourceMemoryId,
    organizationId,
    companyId,
    payload: { relationship: relationship.toJSON() },
  });
}
