import { createDomainEvent, type DomainEvent } from "../../shared";
import type { LearningPattern } from "../entities";

export type PatternDetectedPayload = {
  pattern: ReturnType<LearningPattern["toJSON"]>;
};

export type PatternDetectedEvent = DomainEvent<PatternDetectedPayload>;

export function createPatternDetectedEvent(
  pattern: LearningPattern,
): PatternDetectedEvent {
  return createDomainEvent({
    eventType: "PatternDetected",
    aggregateId: pattern.relatedRecordIds[0] ?? pattern.id,
    companyId: pattern.companyId,
    payload: { pattern: pattern.toJSON() },
  });
}
