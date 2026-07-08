import { createDomainEvent, type DomainEvent } from "../../shared";
import type { ClientLead } from "../entities";

export type LeadCreatedPayload = {
  lead: ReturnType<ClientLead["toJSON"]>;
};

export type LeadCreatedEvent = DomainEvent<LeadCreatedPayload>;

export function createLeadCreatedEvent(lead: ClientLead, journeyId?: string): LeadCreatedEvent {
  return createDomainEvent({
    eventType: "LeadCreated",
    aggregateId: lead.id,
    organizationId: lead.organizationId,
    agencyId: lead.agencyId,
    companyId: lead.companyId,
    journeyId,
    payload: { lead: lead.toJSON() },
  });
}
