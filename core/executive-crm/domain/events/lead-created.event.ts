import { createDomainEvent, type DomainEvent } from "../../shared";
import type { Lead } from "../entities";

export type LeadCreatedPayload = { lead: ReturnType<Lead["toJSON"]> };
export type LeadCreatedEvent = DomainEvent<LeadCreatedPayload>;

export function createLeadCreatedEvent(lead: Lead): LeadCreatedEvent {
  return createDomainEvent({
    eventType: "LeadCreated",
    aggregateId: lead.id,
    organizationId: lead.organizationId,
    payload: { lead: lead.toJSON() },
  });
}
