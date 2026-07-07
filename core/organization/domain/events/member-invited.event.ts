import { createDomainEvent, type DomainEvent } from "../../shared";
import type { OrganizationMember } from "../entities";

export type MemberInvitedPayload = {
  member: ReturnType<OrganizationMember["toJSON"]>;
};

export type MemberInvitedEvent = DomainEvent<MemberInvitedPayload>;

export function createMemberInvitedEvent(member: OrganizationMember): MemberInvitedEvent {
  return createDomainEvent({
    eventType: "MemberInvited",
    aggregateId: member.id,
    organizationId: member.organizationId,
    payload: { member: member.toJSON() },
  });
}
