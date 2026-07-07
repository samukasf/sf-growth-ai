import { createDomainEvent, type DomainEvent } from "../../shared";
import type { ExecutiveRequestId } from "../../shared";
import type { OrchestratorBrainSnapshot } from "../types";

export type EnterpriseSnapshotLoadedPayload = {
  requestId: ExecutiveRequestId;
  organizationId: string;
  snapshot: OrchestratorBrainSnapshot;
};

export type EnterpriseSnapshotLoadedEvent = DomainEvent<EnterpriseSnapshotLoadedPayload>;

export function createEnterpriseSnapshotLoadedEvent(input: {
  requestId: ExecutiveRequestId;
  organizationId: string;
  companyId: string;
  snapshot: OrchestratorBrainSnapshot;
}): EnterpriseSnapshotLoadedEvent {
  return createDomainEvent({
    eventType: "EnterpriseSnapshotLoaded",
    aggregateId: input.requestId,
    companyId: input.companyId,
    payload: {
      requestId: input.requestId,
      organizationId: input.organizationId,
      snapshot: input.snapshot,
    },
  });
}
