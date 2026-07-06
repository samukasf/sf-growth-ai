import { createDomainEvent, type DomainEvent } from "../../shared";
import type { ExecutiveRecommendationPattern } from "../entities";

export type RecommendationValidatedPayload = {
  pattern: ReturnType<ExecutiveRecommendationPattern["toJSON"]>;
  validatedAt: string;
};

export type RecommendationValidatedEvent = DomainEvent<RecommendationValidatedPayload>;

export function createRecommendationValidatedEvent(
  pattern: ExecutiveRecommendationPattern,
): RecommendationValidatedEvent {
  return createDomainEvent({
    eventType: "RecommendationValidated",
    aggregateId: pattern.wisdomId,
    companyId: pattern.companyId,
    payload: {
      pattern: pattern.toJSON(),
      validatedAt: new Date().toISOString(),
    },
  });
}
