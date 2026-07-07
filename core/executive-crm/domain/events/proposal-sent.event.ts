import { createDomainEvent, type DomainEvent } from "../../shared";
import type { Proposal } from "../entities";

export type ProposalSentPayload = { proposal: ReturnType<Proposal["toJSON"]> };
export type ProposalSentEvent = DomainEvent<ProposalSentPayload>;

export function createProposalSentEvent(proposal: Proposal): ProposalSentEvent {
  return createDomainEvent({
    eventType: "ProposalSent",
    aggregateId: proposal.id,
    organizationId: proposal.organizationId,
    payload: { proposal: proposal.toJSON() },
  });
}
