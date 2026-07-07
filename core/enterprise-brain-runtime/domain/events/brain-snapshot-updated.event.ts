import { createDomainEvent, type DomainEvent } from "../../shared";
import type { EnterpriseBrainSnapshot } from "../entities";

export type BrainSnapshotUpdatedPayload = {
  snapshot: ReturnType<EnterpriseBrainSnapshot["toJSON"]>;
};
export type BrainSnapshotUpdatedEvent = DomainEvent<BrainSnapshotUpdatedPayload>;

export function createBrainSnapshotUpdatedEvent(
  snapshot: EnterpriseBrainSnapshot,
): BrainSnapshotUpdatedEvent {
  return createDomainEvent({
    eventType: "BrainSnapshotUpdated",
    aggregateId: snapshot.id,
    organizationId: snapshot.organizationId,
    companyId: snapshot.companyId,
    payload: { snapshot: snapshot.toJSON() },
  });
}
