import { createDomainEvent, type DomainEvent } from "../../shared";

export type ApprovalGrantedPayload = {
  requestId: string;
  approverId: string;
  amount: number;
  grantedAt: string;
};

export type ApprovalGrantedEvent = DomainEvent<ApprovalGrantedPayload>;

export function createApprovalGrantedEvent(input: {
  organizationId: string;
  requestId: string;
  approverId: string;
  amount: number;
}): ApprovalGrantedEvent {
  return createDomainEvent({
    eventType: "ApprovalGranted",
    aggregateId: input.requestId,
    organizationId: input.organizationId,
    payload: {
      requestId: input.requestId,
      approverId: input.approverId,
      amount: input.amount,
      grantedAt: new Date().toISOString(),
    },
  });
}
