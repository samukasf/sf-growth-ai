import { createDomainEvent, type DomainEvent } from "../../shared";
import type { Tenant } from "../entities";

export type TenantSuspendedPayload = {
  tenant: ReturnType<Tenant["toJSON"]>;
};

export type TenantSuspendedEvent = DomainEvent<TenantSuspendedPayload>;

export function createTenantSuspendedEvent(tenant: Tenant): TenantSuspendedEvent {
  return createDomainEvent({
    eventType: "TenantSuspended",
    aggregateId: tenant.id,
    organizationId: tenant.organizationId,
    agencyId: tenant.agencyId,
    tenantId: tenant.id,
    payload: { tenant: tenant.toJSON() },
  });
}
