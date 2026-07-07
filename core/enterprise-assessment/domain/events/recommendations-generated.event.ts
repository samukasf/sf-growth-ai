import type { CompanyId, OrganizationId } from "../../shared";
import { createDomainEvent, type DomainEvent } from "../../shared";
import type { AssessmentRecommendation } from "../entities";

export type RecommendationsGeneratedPayload = {
  assessmentId: string;
  recommendations: ReturnType<AssessmentRecommendation["toJSON"]>[];
  count: number;
};

export type RecommendationsGeneratedEvent = DomainEvent<RecommendationsGeneratedPayload>;

export function createRecommendationsGeneratedEvent(
  assessmentId: string,
  recommendations: AssessmentRecommendation[],
  organizationId: OrganizationId,
  companyId: CompanyId,
): RecommendationsGeneratedEvent {
  return createDomainEvent({
    eventType: "RecommendationsGenerated",
    aggregateId: assessmentId,
    organizationId,
    companyId,
    payload: {
      assessmentId,
      recommendations: recommendations.map((r) => r.toJSON()),
      count: recommendations.length,
    },
  });
}
