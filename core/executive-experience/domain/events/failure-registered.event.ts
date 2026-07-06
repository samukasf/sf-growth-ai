import { createDomainEvent, type DomainEvent } from "../../shared";
import type { FailureCase } from "../entities";

export type FailureRegisteredPayload = {
  failureCase: ReturnType<FailureCase["toJSON"]>;
};

export type FailureRegisteredEvent = DomainEvent<FailureRegisteredPayload>;

export function createFailureRegisteredEvent(failureCase: FailureCase): FailureRegisteredEvent {
  return createDomainEvent({
    eventType: "FailureRegistered",
    aggregateId: failureCase.experienceId,
    companyId: failureCase.companyId,
    payload: { failureCase: failureCase.toJSON() },
  });
}
