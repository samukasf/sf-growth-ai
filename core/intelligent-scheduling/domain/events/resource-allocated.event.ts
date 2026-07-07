import { createDomainEvent, type DomainEvent } from "../../shared";
import type { OrganizationId } from "../../shared";

export type ResourceAllocatedPayload = {
  resourceId: string;
  appointmentId: string;
  startAt: string;
  endAt: string;
};
export type ResourceAllocatedEvent = DomainEvent<ResourceAllocatedPayload>;

export function createResourceAllocatedEvent(input: {
  organizationId: OrganizationId;
  resourceId: string;
  appointmentId: string;
  startAt: string;
  endAt: string;
}): ResourceAllocatedEvent {
  return createDomainEvent({
    eventType: "ResourceAllocated",
    aggregateId: input.appointmentId,
    organizationId: input.organizationId,
    payload: {
      resourceId: input.resourceId,
      appointmentId: input.appointmentId,
      startAt: input.startAt,
      endAt: input.endAt,
    },
  });
}
