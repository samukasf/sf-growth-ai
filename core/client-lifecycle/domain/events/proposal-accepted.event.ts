import { createDomainEvent, type DomainEvent } from "../../shared";
import type { ClientProposal } from "../entities";

export type ProposalAcceptedPayload = {
  proposal: ReturnType<ClientProposal["toJSON"]>;
};

export type ProposalAcceptedEvent = DomainEvent<ProposalAcceptedPayload>;

export function createProposalAcceptedEvent(
  proposal: ClientProposal,
  journeyId?: string,
): ProposalAcceptedEvent {
  return createDomainEvent({
    eventType: "ProposalAccepted",
    aggregateId: proposal.id,
    organizationId: proposal.organizationId,
    agencyId: proposal.agencyId,
    companyId: proposal.companyId,
    journeyId,
    payload: { proposal: proposal.toJSON() },
  });
}
