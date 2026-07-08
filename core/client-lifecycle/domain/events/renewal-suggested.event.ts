import { createDomainEvent, type DomainEvent } from "../../shared";
import type { ClientRenewal } from "../entities";

export type RenewalSuggestedPayload = {
  renewal: ReturnType<ClientRenewal["toJSON"]>;
};

export type RenewalSuggestedEvent = DomainEvent<RenewalSuggestedPayload>;

export function createRenewalSuggestedEvent(
  renewal: ClientRenewal,
  journeyId?: string,
): RenewalSuggestedEvent {
  return createDomainEvent({
    eventType: "RenewalSuggested",
    aggregateId: renewal.id,
    organizationId: renewal.organizationId,
    agencyId: renewal.agencyId,
    companyId: renewal.companyId,
    journeyId,
    payload: { renewal: renewal.toJSON() },
  });
}
