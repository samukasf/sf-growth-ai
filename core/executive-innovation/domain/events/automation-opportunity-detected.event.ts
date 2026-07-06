import { createDomainEvent, type DomainEvent } from "../../shared";
import type { AutomationOpportunity } from "../entities";

export type AutomationOpportunityDetectedPayload = {
  automation: ReturnType<AutomationOpportunity["toJSON"]>;
};

export type AutomationOpportunityDetectedEvent = DomainEvent<AutomationOpportunityDetectedPayload>;

export function createAutomationOpportunityDetectedEvent(
  automation: AutomationOpportunity,
): AutomationOpportunityDetectedEvent {
  return createDomainEvent({
    eventType: "AutomationOpportunityDetected",
    aggregateId: automation.opportunityId,
    companyId: automation.companyId,
    payload: { automation: automation.toJSON() },
  });
}
