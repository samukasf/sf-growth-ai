import { createDomainEvent, type DomainEvent } from "../../shared";
import type { EnterprisePlatform } from "../entities";

export type PlatformHealthUpdatedPayload = {
  platform: ReturnType<EnterprisePlatform["toJSON"]>;
  previousScore: number;
};
export type PlatformHealthUpdatedEvent = DomainEvent<PlatformHealthUpdatedPayload>;

export function createPlatformHealthUpdatedEvent(
  platform: EnterprisePlatform,
  previousScore: number,
): PlatformHealthUpdatedEvent {
  return createDomainEvent({
    eventType: "PlatformHealthUpdated",
    aggregateId: platform.id,
    organizationId: platform.organizationId,
    payload: { platform: platform.toJSON(), previousScore },
  });
}
