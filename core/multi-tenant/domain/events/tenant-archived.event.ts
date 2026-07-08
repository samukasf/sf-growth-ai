import { createDomainEvent, type DomainEvent } from "../../shared";
import type { Tenant } from "../entities";

export type TenantArchivedPayload = {
  tenant: ReturnType<Tenant["toJSON"]>;
};

export type TenantArchivedEvent = DomainEvent<TenantArchivedPayload>;

export function createTenantArchivedEvent(tenant: Tenant): TenantArchivedEvent {
  return createDomainEvent({
    eventType: "TenantArchived",
    aggregateId: tenant.id,
    organizationId: tenant.organizationId,
    agencyId: tenant.agencyId,
    tenantId: tenant.id,
    payload: { tenant: tenant.toJSON() },
  });
}
