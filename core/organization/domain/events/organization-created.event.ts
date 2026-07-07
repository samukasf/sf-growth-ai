import { createDomainEvent, type DomainEvent } from "../../shared";
import type { Organization } from "../entities";

export type OrganizationCreatedPayload = {
  organization: ReturnType<Organization["toJSON"]>;
};

export type OrganizationCreatedEvent = DomainEvent<OrganizationCreatedPayload>;

export function createOrganizationCreatedEvent(
  organization: Organization,
): OrganizationCreatedEvent {
  return createDomainEvent({
    eventType: "OrganizationCreated",
    aggregateId: organization.id,
    organizationId: organization.id,
    payload: { organization: organization.toJSON() },
  });
}
