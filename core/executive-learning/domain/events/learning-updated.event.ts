import { createDomainEvent, type DomainEvent } from "../../shared";
import type { LearningRecord } from "../entities";

export type LearningUpdatedPayload = {
  record: ReturnType<LearningRecord["toJSON"]>;
  changedFields: string[];
};

export type LearningUpdatedEvent = DomainEvent<LearningUpdatedPayload>;

export function createLearningUpdatedEvent(
  record: LearningRecord,
  changedFields: string[],
): LearningUpdatedEvent {
  return createDomainEvent({
    eventType: "LearningUpdated",
    aggregateId: record.id,
    companyId: record.companyId,
    payload: { record: record.toJSON(), changedFields },
  });
}
