import { createDomainEvent, type DomainEvent } from "../../shared";
import type { KnowledgeRelation } from "../entities";

export type KnowledgeLinkedPayload = {
  relation: ReturnType<KnowledgeRelation["toJSON"]>;
};

export type KnowledgeLinkedEvent = DomainEvent<KnowledgeLinkedPayload>;

export function createKnowledgeLinkedEvent(
  relation: KnowledgeRelation,
  companyId: string,
): KnowledgeLinkedEvent {
  return createDomainEvent({
    eventType: "KnowledgeLinked",
    aggregateId: relation.sourceRecordId,
    companyId,
    payload: { relation: relation.toJSON() },
  });
}
