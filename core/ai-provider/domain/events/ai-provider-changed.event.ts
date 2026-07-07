import { createDomainEvent, type DomainEvent } from "../../shared";
import type { OrganizationId } from "../../shared";

export type AIProviderChangedPayload = {
  previousProviderId: string;
  newProviderId: string;
  reason: string;
};
export type AIProviderChangedEvent = DomainEvent<AIProviderChangedPayload>;

export function createAIProviderChangedEvent(input: {
  organizationId: OrganizationId;
  previousProviderId: string;
  newProviderId: string;
  reason: string;
}): AIProviderChangedEvent {
  return createDomainEvent({
    eventType: "AIProviderChanged",
    aggregateId: input.newProviderId,
    organizationId: input.organizationId,
    payload: {
      previousProviderId: input.previousProviderId,
      newProviderId: input.newProviderId,
      reason: input.reason,
    },
  });
}
