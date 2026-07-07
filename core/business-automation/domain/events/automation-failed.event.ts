import { createDomainEvent, type DomainEvent } from "../../shared";
import type { OrganizationId, AutomationId } from "../../shared";

export type AutomationFailedPayload = {
  automationId: AutomationId;
  executionId: string;
  errorMessage: string;
};

export type AutomationFailedEvent = DomainEvent<AutomationFailedPayload>;

export function createAutomationFailedEvent(input: {
  automationId: AutomationId;
  organizationId: OrganizationId;
  executionId: string;
  errorMessage: string;
}): AutomationFailedEvent {
  return createDomainEvent({
    eventType: "AutomationFailed",
    aggregateId: input.automationId,
    organizationId: input.organizationId,
    payload: {
      automationId: input.automationId,
      executionId: input.executionId,
      errorMessage: input.errorMessage,
    },
  });
}
