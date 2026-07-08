import { createDomainEvent, type DomainEvent } from "../../shared";
import type { ClientOnboarding } from "../entities";

export type ClientOnboardedPayload = {
  onboarding: ReturnType<ClientOnboarding["toJSON"]>;
};

export type ClientOnboardedEvent = DomainEvent<ClientOnboardedPayload>;

export function createClientOnboardedEvent(
  onboarding: ClientOnboarding,
  journeyId?: string,
): ClientOnboardedEvent {
  return createDomainEvent({
    eventType: "ClientOnboarded",
    aggregateId: onboarding.id,
    organizationId: onboarding.organizationId,
    agencyId: onboarding.agencyId,
    companyId: onboarding.companyId,
    journeyId,
    payload: { onboarding: onboarding.toJSON() },
  });
}
