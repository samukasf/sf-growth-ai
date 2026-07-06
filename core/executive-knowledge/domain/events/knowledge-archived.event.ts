import { createDomainEvent, type DomainEvent } from "../../shared";
import type { KnowledgeRecord } from "../entities";

export type KnowledgeArchivedPayload = {
  record: ReturnType<KnowledgeRecord["toJSON"]>;
  archivedAt: string;
};

export type KnowledgeArchivedEvent = DomainEvent<KnowledgeArchivedPayload>;

export function createKnowledgeArchivedEvent(
  record: KnowledgeRecord,
): KnowledgeArchivedEvent {
  return createDomainEvent({
    eventType: "KnowledgeArchived",
    aggregateId: record.id,
    companyId: record.companyId,
    payload: {
      record: record.toJSON(),
      archivedAt: new Date().toISOString(),
    },
  });
}
