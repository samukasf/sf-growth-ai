import { createDomainEvent, type DomainEvent } from "../../shared";
import type { CouncilOpinion } from "../entities";

export type OpinionSubmittedPayload = {
  opinion: ReturnType<CouncilOpinion["toJSON"]>;
};
export type OpinionSubmittedEvent = DomainEvent<OpinionSubmittedPayload>;

export function createOpinionSubmittedEvent(
  opinion: CouncilOpinion,
  organizationId: string,
  companyId: string,
): OpinionSubmittedEvent {
  return createDomainEvent({
    eventType: "OpinionSubmitted",
    aggregateId: opinion.sessionId,
    organizationId,
    companyId,
    payload: { opinion: opinion.toJSON() },
  });
}
