import { createDomainEvent, type DomainEvent } from "../../shared";
import type { LearningRecord } from "../entities";

export type LearningValidatedPayload = {
  record: ReturnType<LearningRecord["toJSON"]>;
  validatedAt: string;
};

export type LearningValidatedEvent = DomainEvent<LearningValidatedPayload>;

export function createLearningValidatedEvent(
  record: LearningRecord,
): LearningValidatedEvent {
  return createDomainEvent({
    eventType: "LearningValidated",
    aggregateId: record.id,
    companyId: record.companyId,
    payload: {
      record: record.toJSON(),
      validatedAt: new Date().toISOString(),
    },
  });
}
