import { createDomainEvent, type DomainEvent } from "../../shared";

export type ApprovalRejectedPayload = {
  requestId: string;
  approverId: string;
  reason: string;
  rejectedAt: string;
};

export type ApprovalRejectedEvent = DomainEvent<ApprovalRejectedPayload>;

export function createApprovalRejectedEvent(input: {
  organizationId: string;
  requestId: string;
  approverId: string;
  reason: string;
}): ApprovalRejectedEvent {
  return createDomainEvent({
    eventType: "ApprovalRejected",
    aggregateId: input.requestId,
    organizationId: input.organizationId,
    payload: {
      requestId: input.requestId,
      approverId: input.approverId,
      reason: input.reason,
      rejectedAt: new Date().toISOString(),
    },
  });
}
