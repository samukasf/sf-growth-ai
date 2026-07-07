import { createDomainEvent, type DomainEvent } from "../../shared";
import type { CouncilMember } from "../entities";

export type CouncilMemberInvitedPayload = {
  member: ReturnType<CouncilMember["toJSON"]>;
};
export type CouncilMemberInvitedEvent = DomainEvent<CouncilMemberInvitedPayload>;

export function createCouncilMemberInvitedEvent(
  member: CouncilMember,
  organizationId: string,
  companyId: string,
): CouncilMemberInvitedEvent {
  return createDomainEvent({
    eventType: "CouncilMemberInvited",
    aggregateId: member.sessionId,
    organizationId,
    companyId,
    payload: { member: member.toJSON() },
  });
}
