import { createDomainEvent, type DomainEvent } from "../../shared";
import type { AgencyKPI } from "../entities";

export type KPIUpdatedPayload = {
  kpi: ReturnType<AgencyKPI["toJSON"]>;
};

export type KPIUpdatedEvent = DomainEvent<KPIUpdatedPayload>;

export function createKPIUpdatedEvent(kpi: AgencyKPI): KPIUpdatedEvent {
  return createDomainEvent({
    eventType: "KPIUpdated",
    aggregateId: kpi.id,
    organizationId: kpi.organizationId,
    agencyId: kpi.agencyId,
    payload: { kpi: kpi.toJSON() },
  });
}
