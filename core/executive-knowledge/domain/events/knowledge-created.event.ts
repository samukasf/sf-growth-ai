import { createDomainEvent, type DomainEvent } from "../../shared";
import type { KnowledgeRecord } from "../entities";

export type KnowledgeCreatedPayload = {
  record: ReturnType<KnowledgeRecord["toJSON"]>;
};

export type KnowledgeCreatedEvent = DomainEvent<KnowledgeCreatedPayload>;

export function createKnowledgeCreatedEvent(
  record: KnowledgeRecord,
): KnowledgeCreatedEvent {
  return createDomainEvent({
    eventType: "KnowledgeCreated",
    aggregateId: record.id,
    companyId: record.companyId,
    payload: { record: record.toJSON() },
  });
}
