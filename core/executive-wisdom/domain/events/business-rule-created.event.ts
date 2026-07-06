import { createDomainEvent, type DomainEvent } from "../../shared";
import type { ExecutiveBusinessRule } from "../entities";

export type BusinessRuleCreatedPayload = {
  rule: ReturnType<ExecutiveBusinessRule["toJSON"]>;
};

export type BusinessRuleCreatedEvent = DomainEvent<BusinessRuleCreatedPayload>;

export function createBusinessRuleCreatedEvent(
  rule: ExecutiveBusinessRule,
): BusinessRuleCreatedEvent {
  return createDomainEvent({
    eventType: "BusinessRuleCreated",
    aggregateId: rule.wisdomId,
    companyId: rule.companyId,
    payload: { rule: rule.toJSON() },
  });
}
