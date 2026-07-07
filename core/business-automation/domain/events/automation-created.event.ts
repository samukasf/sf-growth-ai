import { createDomainEvent, type DomainEvent } from "../../shared";
import type { Automation } from "../entities";

export type AutomationCreatedPayload = {
  automation: ReturnType<Automation["toJSON"]>;
};

export type AutomationCreatedEvent = DomainEvent<AutomationCreatedPayload>;

export function createAutomationCreatedEvent(automation: Automation): AutomationCreatedEvent {
  return createDomainEvent({
    eventType: "AutomationCreated",
    aggregateId: automation.id,
    organizationId: automation.organizationId,
    payload: { automation: automation.toJSON() },
  });
}
