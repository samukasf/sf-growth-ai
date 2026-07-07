import { createDomainEvent, type DomainEvent } from "../../shared";

export type ApprovalRequestedPayload = {
  requestId: string;
  memberId: string;
  amount: number;
  currency: string;
  description: string;
  requestedAt: string;
};

export type ApprovalRequestedEvent = DomainEvent<ApprovalRequestedPayload>;

export function createApprovalRequestedEvent(input: {
  organizationId: string;
  requestId: string;
  memberId: string;
  amount: number;
  currency: string;
  description: string;
}): ApprovalRequestedEvent {
  return createDomainEvent({
    eventType: "ApprovalRequested",
    aggregateId: input.requestId,
    organizationId: input.organizationId,
    payload: {
      requestId: input.requestId,
      memberId: input.memberId,
      amount: input.amount,
      currency: input.currency,
      description: input.description,
      requestedAt: new Date().toISOString(),
    },
  });
}
