import { createDomainEvent, type DomainEvent } from "../../shared";
import type { AutomationResult } from "../entities";

export type AutomationCompletedPayload = {
  result: ReturnType<AutomationResult["toJSON"]>;
};

export type AutomationCompletedEvent = DomainEvent<AutomationCompletedPayload>;

export function createAutomationCompletedEvent(
  result: AutomationResult,
): AutomationCompletedEvent {
  return createDomainEvent({
    eventType: "AutomationCompleted",
    aggregateId: result.executionId,
    organizationId: result.organizationId,
    payload: { result: result.toJSON() },
  });
}
