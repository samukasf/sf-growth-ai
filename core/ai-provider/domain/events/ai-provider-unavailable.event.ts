import { createDomainEvent, type DomainEvent } from "../../shared";
import type { OrganizationId } from "../../shared";

export type AIProviderUnavailablePayload = {
  providerId: string;
  providerType: string;
  reason: string;
};
export type AIProviderUnavailableEvent = DomainEvent<AIProviderUnavailablePayload>;

export function createAIProviderUnavailableEvent(input: {
  organizationId: OrganizationId;
  providerId: string;
  providerType: string;
  reason: string;
}): AIProviderUnavailableEvent {
  return createDomainEvent({
    eventType: "AIProviderUnavailable",
    aggregateId: input.providerId,
    organizationId: input.organizationId,
    payload: {
      providerId: input.providerId,
      providerType: input.providerType,
      reason: input.reason,
    },
  });
}
