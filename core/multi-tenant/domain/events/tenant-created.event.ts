import { createDomainEvent, type DomainEvent } from "../../shared";
import type { Tenant } from "../entities";

export type TenantCreatedPayload = {
  tenant: ReturnType<Tenant["toJSON"]>;
};

export type TenantCreatedEvent = DomainEvent<TenantCreatedPayload>;

export function createTenantCreatedEvent(tenant: Tenant): TenantCreatedEvent {
  return createDomainEvent({
    eventType: "TenantCreated",
    aggregateId: tenant.id,
    organizationId: tenant.organizationId,
    agencyId: tenant.agencyId,
    tenantId: tenant.id,
    payload: { tenant: tenant.toJSON() },
  });
}
