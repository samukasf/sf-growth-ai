import { createDomainEvent, type DomainEvent } from "../../shared";
import type { OrganizationMember } from "../entities";

export type MemberActivatedPayload = {
  member: ReturnType<OrganizationMember["toJSON"]>;
  activatedAt: string;
};

export type MemberActivatedEvent = DomainEvent<MemberActivatedPayload>;

export function createMemberActivatedEvent(
  member: OrganizationMember,
): MemberActivatedEvent {
  return createDomainEvent({
    eventType: "MemberActivated",
    aggregateId: member.id,
    organizationId: member.organizationId,
    payload: {
      member: member.toJSON(),
      activatedAt: new Date().toISOString(),
    },
  });
}
