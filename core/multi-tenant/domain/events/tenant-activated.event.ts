import { createDomainEvent, type DomainEvent } from "../../shared";
import type { Tenant } from "../entities";

export type TenantActivatedPayload = {
  tenant: ReturnType<Tenant["toJSON"]>;
};

export type TenantActivatedEvent = DomainEvent<TenantActivatedPayload>;

export function createTenantActivatedEvent(tenant: Tenant): TenantActivatedEvent {
  return createDomainEvent({
    eventType: "TenantActivated",
    aggregateId: tenant.id,
    organizationId: tenant.organizationId,
    agencyId: tenant.agencyId,
    tenantId: tenant.id,
    payload: { tenant: tenant.toJSON() },
  });
}
