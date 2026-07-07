import { createDomainEvent, type DomainEvent } from "../../shared";
import type { Lead } from "../entities";

export type LeadQualifiedPayload = {
  lead: ReturnType<Lead["toJSON"]>;
  score: number;
};
export type LeadQualifiedEvent = DomainEvent<LeadQualifiedPayload>;

export function createLeadQualifiedEvent(lead: Lead, score: number): LeadQualifiedEvent {
  return createDomainEvent({
    eventType: "LeadQualified",
    aggregateId: lead.id,
    organizationId: lead.organizationId,
    payload: { lead: lead.toJSON(), score },
  });
}
