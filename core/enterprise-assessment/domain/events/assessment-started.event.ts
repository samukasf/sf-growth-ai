import { createDomainEvent, type DomainEvent } from "../../shared";
import type { Assessment } from "../entities";

export type AssessmentStartedPayload = {
  assessment: ReturnType<Assessment["toJSON"]>;
};

export type AssessmentStartedEvent = DomainEvent<AssessmentStartedPayload>;

export function createAssessmentStartedEvent(assessment: Assessment): AssessmentStartedEvent {
  return createDomainEvent({
    eventType: "AssessmentStarted",
    aggregateId: assessment.id,
    organizationId: assessment.organizationId,
    companyId: assessment.companyId,
    payload: { assessment: assessment.toJSON() },
  });
}
