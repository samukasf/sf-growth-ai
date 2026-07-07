import { createDomainEvent, type DomainEvent } from "../../shared";
import type { Assessment } from "../entities";

export type AssessmentCompletedPayload = {
  assessment: ReturnType<Assessment["toJSON"]>;
};

export type AssessmentCompletedEvent = DomainEvent<AssessmentCompletedPayload>;

export function createAssessmentCompletedEvent(
  assessment: Assessment,
): AssessmentCompletedEvent {
  return createDomainEvent({
    eventType: "AssessmentCompleted",
    aggregateId: assessment.id,
    organizationId: assessment.organizationId,
    companyId: assessment.companyId,
    payload: { assessment: assessment.toJSON() },
  });
}
