import { createDomainEvent, type DomainEvent } from "../../shared";
import type { ExecutiveRequestId } from "../../shared";

export type EnterpriseSnapshotRequestedPayload = {
  requestId: ExecutiveRequestId;
  organizationId: string;
  companyId: string;
};

export type EnterpriseSnapshotRequestedEvent = DomainEvent<EnterpriseSnapshotRequestedPayload>;

export function createEnterpriseSnapshotRequestedEvent(input: {
  requestId: ExecutiveRequestId;
  organizationId: string;
  companyId: string;
}): EnterpriseSnapshotRequestedEvent {
  return createDomainEvent({
    eventType: "EnterpriseSnapshotRequested",
    aggregateId: input.requestId,
    companyId: input.companyId,
    payload: {
      requestId: input.requestId,
      organizationId: input.organizationId,
      companyId: input.companyId,
    },
  });
}
