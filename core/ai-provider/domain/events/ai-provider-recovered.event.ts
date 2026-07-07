import { createDomainEvent, type DomainEvent } from "../../shared";
import type { OrganizationId } from "../../shared";

export type AIProviderRecoveredPayload = {
  providerId: string;
  providerType: string;
};
export type AIProviderRecoveredEvent = DomainEvent<AIProviderRecoveredPayload>;

export function createAIProviderRecoveredEvent(input: {
  organizationId: OrganizationId;
  providerId: string;
  providerType: string;
}): AIProviderRecoveredEvent {
  return createDomainEvent({
    eventType: "AIProviderRecovered",
    aggregateId: input.providerId,
    organizationId: input.organizationId,
    payload: {
      providerId: input.providerId,
      providerType: input.providerType,
    },
  });
}
