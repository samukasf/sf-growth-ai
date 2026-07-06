import { createDomainEvent, type DomainEvent } from "../../shared";
import type { LearningFeedback } from "../entities";

export type FeedbackReceivedPayload = {
  feedback: ReturnType<LearningFeedback["toJSON"]>;
};

export type FeedbackReceivedEvent = DomainEvent<FeedbackReceivedPayload>;

export function createFeedbackReceivedEvent(
  feedback: LearningFeedback,
): FeedbackReceivedEvent {
  return createDomainEvent({
    eventType: "FeedbackReceived",
    aggregateId: feedback.recordId,
    companyId: feedback.companyId,
    payload: { feedback: feedback.toJSON() },
  });
}
