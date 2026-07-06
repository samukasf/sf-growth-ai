import { createDomainEvent, type DomainEvent } from "../../shared";
import type { BusinessCase } from "../entities";

export type CaseCompletedPayload = {
  businessCase: ReturnType<BusinessCase["toJSON"]>;
};

export type CaseCompletedEvent = DomainEvent<CaseCompletedPayload>;

export function createCaseCompletedEvent(businessCase: BusinessCase): CaseCompletedEvent {
  return createDomainEvent({
    eventType: "CaseCompleted",
    aggregateId: businessCase.experienceId,
    companyId: businessCase.companyId,
    payload: { businessCase: businessCase.toJSON() },
  });
}
