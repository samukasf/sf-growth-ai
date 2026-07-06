import { createDomainEvent, type DomainEvent } from "../../shared";
import type { SuccessCase } from "../entities";

export type SuccessRegisteredPayload = {
  successCase: ReturnType<SuccessCase["toJSON"]>;
};

export type SuccessRegisteredEvent = DomainEvent<SuccessRegisteredPayload>;

export function createSuccessRegisteredEvent(successCase: SuccessCase): SuccessRegisteredEvent {
  return createDomainEvent({
    eventType: "SuccessRegistered",
    aggregateId: successCase.experienceId,
    companyId: successCase.companyId,
    payload: { successCase: successCase.toJSON() },
  });
}
