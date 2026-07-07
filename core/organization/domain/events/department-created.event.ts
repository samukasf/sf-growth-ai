import { createDomainEvent, type DomainEvent } from "../../shared";
import type { Department } from "../entities";

export type DepartmentCreatedPayload = {
  department: ReturnType<Department["toJSON"]>;
};

export type DepartmentCreatedEvent = DomainEvent<DepartmentCreatedPayload>;

export function createDepartmentCreatedEvent(
  department: Department,
): DepartmentCreatedEvent {
  return createDomainEvent({
    eventType: "DepartmentCreated",
    aggregateId: department.id,
    organizationId: department.organizationId,
    payload: { department: department.toJSON() },
  });
}
