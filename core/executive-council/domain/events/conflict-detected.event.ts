import { createDomainEvent, type DomainEvent } from "../../shared";
import type { CouncilConflict } from "../entities";

export type ConflictDetectedPayload = {
  conflict: ReturnType<CouncilConflict["toJSON"]>;
};
export type ConflictDetectedEvent = DomainEvent<ConflictDetectedPayload>;

export function createConflictDetectedEvent(
  conflict: CouncilConflict,
  organizationId: string,
  companyId: string,
): ConflictDetectedEvent {
  return createDomainEvent({
    eventType: "ConflictDetected",
    aggregateId: conflict.sessionId,
    organizationId,
    companyId,
    payload: { conflict: conflict.toJSON() },
  });
}
