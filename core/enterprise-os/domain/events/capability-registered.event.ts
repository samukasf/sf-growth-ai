import { createDomainEvent, type DomainEvent } from "../../shared";
import type { BusinessCapability } from "../entities";

export type CapabilityRegisteredPayload = {
  capability: ReturnType<BusinessCapability["toJSON"]>;
};
export type CapabilityRegisteredEvent = DomainEvent<CapabilityRegisteredPayload>;

export function createCapabilityRegisteredEvent(
  capability: BusinessCapability,
): CapabilityRegisteredEvent {
  return createDomainEvent({
    eventType: "CapabilityRegistered",
    aggregateId: capability.id,
    organizationId: capability.organizationId,
    payload: { capability: capability.toJSON() },
  });
}
