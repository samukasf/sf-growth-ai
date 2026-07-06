import { createDomainEvent, type DomainEvent } from "../../shared";
import type { LearningRecord } from "../entities";

export type LearningCreatedPayload = {
  record: ReturnType<LearningRecord["toJSON"]>;
};

export type LearningCreatedEvent = DomainEvent<LearningCreatedPayload>;

export function createLearningCreatedEvent(record: LearningRecord): LearningCreatedEvent {
  return createDomainEvent({
    eventType: "LearningCreated",
    aggregateId: record.id,
    companyId: record.companyId,
    payload: { record: record.toJSON() },
  });
}
