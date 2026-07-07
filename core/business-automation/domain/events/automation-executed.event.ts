import { createDomainEvent, type DomainEvent } from "../../shared";
import type { AutomationExecution } from "../entities";

export type AutomationExecutedPayload = {
  execution: ReturnType<AutomationExecution["toJSON"]>;
};

export type AutomationExecutedEvent = DomainEvent<AutomationExecutedPayload>;

export function createAutomationExecutedEvent(
  execution: AutomationExecution,
): AutomationExecutedEvent {
  return createDomainEvent({
    eventType: "AutomationExecuted",
    aggregateId: execution.automationId,
    organizationId: execution.organizationId,
    payload: { execution: execution.toJSON() },
  });
}
