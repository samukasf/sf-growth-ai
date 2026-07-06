import { createDomainEvent, type DomainEvent } from "../../shared";
import type { KnowledgeRecord } from "../entities";

export type KnowledgeUpdatedPayload = {
  record: ReturnType<KnowledgeRecord["toJSON"]>;
  changedFields: string[];
};

export type KnowledgeUpdatedEvent = DomainEvent<KnowledgeUpdatedPayload>;

export function createKnowledgeUpdatedEvent(
  record: KnowledgeRecord,
  changedFields: string[],
): KnowledgeUpdatedEvent {
  return createDomainEvent({
    eventType: "KnowledgeUpdated",
    aggregateId: record.id,
    companyId: record.companyId,
    payload: {
      record: record.toJSON(),
      changedFields,
    },
  });
}
