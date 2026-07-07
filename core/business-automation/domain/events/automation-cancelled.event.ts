import { createDomainEvent, type DomainEvent } from "../../shared";
import type { AutomationExecution } from "../entities";

export type AutomationCancelledPayload = {
  execution: ReturnType<AutomationExecution["toJSON"]>;
};

export type AutomationCancelledEvent = DomainEvent<AutomationCancelledPayload>;

export function createAutomationCancelledEvent(
  execution: AutomationExecution,
): AutomationCancelledEvent {
  return createDomainEvent({
    eventType: "AutomationCancelled",
    aggregateId: execution.automationId,
    organizationId: execution.organizationId,
    payload: { execution: execution.toJSON() },
  });
}
