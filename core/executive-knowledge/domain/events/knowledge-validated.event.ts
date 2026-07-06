import { createDomainEvent, type DomainEvent } from "../../shared";
import type { KnowledgeRecord } from "../entities";

export type KnowledgeValidatedPayload = {
  record: ReturnType<KnowledgeRecord["toJSON"]>;
  validatedAt: string;
};

export type KnowledgeValidatedEvent = DomainEvent<KnowledgeValidatedPayload>;

export function createKnowledgeValidatedEvent(
  record: KnowledgeRecord,
): KnowledgeValidatedEvent {
  return createDomainEvent({
    eventType: "KnowledgeValidated",
    aggregateId: record.id,
    companyId: record.companyId,
    payload: {
      record: record.toJSON(),
      validatedAt: new Date().toISOString(),
    },
  });
}
