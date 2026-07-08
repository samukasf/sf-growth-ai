import { createDomainEvent, type DomainEvent } from "../../shared";
import type { Tenant } from "../entities";

export type TenantDeletedPayload = {
  tenant: ReturnType<Tenant["toJSON"]>;
};

export type TenantDeletedEvent = DomainEvent<TenantDeletedPayload>;

export function createTenantDeletedEvent(tenant: Tenant): TenantDeletedEvent {
  return createDomainEvent({
    eventType: "TenantDeleted",
    aggregateId: tenant.id,
    organizationId: tenant.organizationId,
    agencyId: tenant.agencyId,
    tenantId: tenant.id,
    payload: { tenant: tenant.toJSON() },
  });
}
