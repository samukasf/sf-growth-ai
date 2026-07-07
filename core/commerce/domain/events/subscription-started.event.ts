import { createDomainEvent, type DomainEvent } from "../../shared";
import type { Subscription } from "../entities";

export type SubscriptionStartedPayload = { subscription: ReturnType<Subscription["toJSON"]> };
export type SubscriptionStartedEvent = DomainEvent<SubscriptionStartedPayload>;

export function createSubscriptionStartedEvent(
  subscription: Subscription,
): SubscriptionStartedEvent {
  return createDomainEvent({
    eventType: "SubscriptionStarted",
    aggregateId: subscription.id,
    organizationId: subscription.organizationId,
    payload: { subscription: subscription.toJSON() },
  });
}
