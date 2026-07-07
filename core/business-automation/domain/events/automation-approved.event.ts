import { createDomainEvent, type DomainEvent } from "../../shared";
import type { AutomationApproval } from "../entities";

export type AutomationApprovedPayload = {
  approval: ReturnType<AutomationApproval["toJSON"]>;
};

export type AutomationApprovedEvent = DomainEvent<AutomationApprovedPayload>;

export function createAutomationApprovedEvent(
  approval: AutomationApproval,
): AutomationApprovedEvent {
  return createDomainEvent({
    eventType: "AutomationApproved",
    aggregateId: approval.automationId,
    organizationId: approval.organizationId,
    payload: { approval: approval.toJSON() },
  });
}
