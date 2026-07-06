import { createDomainEvent, type DomainEvent } from "../../shared";
import type { ExecutiveParticipantId } from "../../shared";

export type ExecutiveExecutiveInvitedPayload = {
  requestId: string;
  participantId: ExecutiveParticipantId;
  reason: string;
  invitedAt: string;
};

export type ExecutiveExecutiveInvitedEvent = DomainEvent<ExecutiveExecutiveInvitedPayload>;

export function createExecutiveExecutiveInvitedEvent(input: {
  requestId: string;
  companyId: string;
  participantId: ExecutiveParticipantId;
  reason: string;
}): ExecutiveExecutiveInvitedEvent {
  return createDomainEvent({
    eventType: "ExecutiveExecutiveInvited",
    aggregateId: input.requestId,
    companyId: input.companyId,
    payload: {
      requestId: input.requestId,
      participantId: input.participantId,
      reason: input.reason,
      invitedAt: new Date().toISOString(),
    },
  });
}
