import { createDomainEvent, type DomainEvent } from "../../shared";
import type { BusinessRoutine } from "../entities";

export type RoutineCreatedPayload = {
  routine: ReturnType<BusinessRoutine["toJSON"]>;
};

export type RoutineCreatedEvent = DomainEvent<RoutineCreatedPayload>;

export function createRoutineCreatedEvent(
  routine: BusinessRoutine,
  businessDayId?: string,
): RoutineCreatedEvent {
  return createDomainEvent({
    eventType: "RoutineCreated",
    aggregateId: routine.id,
    organizationId: routine.organizationId,
    companyId: routine.companyId,
    agencyId: routine.agencyId,
    businessDayId,
    payload: { routine: routine.toJSON() },
  });
}
