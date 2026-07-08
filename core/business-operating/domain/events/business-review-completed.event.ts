import { createDomainEvent, type DomainEvent } from "../../shared";
import type { BusinessReview } from "../entities";

export type BusinessReviewCompletedPayload = {
  review: ReturnType<BusinessReview["toJSON"]>;
};

export type BusinessReviewCompletedEvent = DomainEvent<BusinessReviewCompletedPayload>;

export function createBusinessReviewCompletedEvent(
  review: BusinessReview,
): BusinessReviewCompletedEvent {
  return createDomainEvent({
    eventType: "BusinessReviewCompleted",
    aggregateId: review.id,
    organizationId: review.organizationId,
    companyId: review.companyId,
    agencyId: review.agencyId,
    businessDayId: review.businessDayId,
    payload: { review: review.toJSON() },
  });
}
