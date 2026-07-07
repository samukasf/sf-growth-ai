import { createDomainEvent, type DomainEvent } from "../../shared";
import type { EnterprisePlatform } from "../entities";

export type PlatformRegisteredPayload = {
  platform: ReturnType<EnterprisePlatform["toJSON"]>;
};
export type PlatformRegisteredEvent = DomainEvent<PlatformRegisteredPayload>;

export function createPlatformRegisteredEvent(
  platform: EnterprisePlatform,
): PlatformRegisteredEvent {
  return createDomainEvent({
    eventType: "PlatformRegistered",
    aggregateId: platform.id,
    organizationId: platform.organizationId,
    payload: { platform: platform.toJSON() },
  });
}
