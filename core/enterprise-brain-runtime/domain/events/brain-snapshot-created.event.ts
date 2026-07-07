import { createDomainEvent, type DomainEvent } from "../../shared";
import type { EnterpriseBrainSnapshot } from "../entities";

export type BrainSnapshotCreatedPayload = {
  snapshot: ReturnType<EnterpriseBrainSnapshot["toJSON"]>;
};
export type BrainSnapshotCreatedEvent = DomainEvent<BrainSnapshotCreatedPayload>;

export function createBrainSnapshotCreatedEvent(
  snapshot: EnterpriseBrainSnapshot,
): BrainSnapshotCreatedEvent {
  return createDomainEvent({
    eventType: "BrainSnapshotCreated",
    aggregateId: snapshot.id,
    organizationId: snapshot.organizationId,
    companyId: snapshot.companyId,
    payload: { snapshot: snapshot.toJSON() },
  });
}
