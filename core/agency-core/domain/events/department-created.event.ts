import { createDomainEvent, type DomainEvent } from "../../shared";
import type { AgencyDepartment } from "../entities";

export type DepartmentCreatedPayload = {
  department: ReturnType<AgencyDepartment["toJSON"]>;
};

export type DepartmentCreatedEvent = DomainEvent<DepartmentCreatedPayload>;

export function createDepartmentCreatedEvent(
  department: AgencyDepartment,
): DepartmentCreatedEvent {
  return createDomainEvent({
    eventType: "DepartmentCreated",
    aggregateId: department.id,
    organizationId: department.organizationId,
    agencyId: department.agencyId,
    payload: { department: department.toJSON() },
  });
}
