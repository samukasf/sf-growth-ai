import type { CompanyId, OrganizationId } from "../../shared";
import { createDomainEvent, type DomainEvent } from "../../shared";
import type { AssessmentScore } from "../entities";

export type ScoreCalculatedPayload = {
  score: ReturnType<AssessmentScore["toJSON"]>;
};

export type ScoreCalculatedEvent = DomainEvent<ScoreCalculatedPayload>;

export function createScoreCalculatedEvent(
  score: AssessmentScore,
  organizationId: OrganizationId,
  companyId: CompanyId,
): ScoreCalculatedEvent {
  return createDomainEvent({
    eventType: "ScoreCalculated",
    aggregateId: score.assessmentId,
    organizationId,
    companyId,
    payload: { score: score.toJSON() },
  });
}
