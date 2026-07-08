import { createDomainEvent, type DomainEvent } from "../../shared";
import type { BusinessPriority } from "../entities";

export type PriorityCalculatedPayload = {
  priorities: ReturnType<BusinessPriority["toJSON"]>[];
};

export type PriorityCalculatedEvent = DomainEvent<PriorityCalculatedPayload>;

export function createPriorityCalculatedEvent(
  priorities: BusinessPriority[],
  businessDayId?: string,
): PriorityCalculatedEvent {
  const first = priorities[0];
  return createDomainEvent({
    eventType: "PriorityCalculated",
    aggregateId: first?.id ?? "priorities",
    organizationId: first.organizationId,
    companyId: first.companyId,
    agencyId: first.agencyId,
    businessDayId,
    payload: { priorities: priorities.map((p) => p.toJSON()) },
  });
}
