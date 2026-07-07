import { createDomainEvent, type DomainEvent } from "../../shared";
import type { Appointment } from "../entities";

export type AppointmentCreatedPayload = {
  appointment: ReturnType<Appointment["toJSON"]>;
};
export type AppointmentCreatedEvent = DomainEvent<AppointmentCreatedPayload>;

export function createAppointmentCreatedEvent(
  appointment: Appointment,
): AppointmentCreatedEvent {
  return createDomainEvent({
    eventType: "AppointmentCreated",
    aggregateId: appointment.id,
    organizationId: appointment.organizationId,
    payload: { appointment: appointment.toJSON() },
  });
}
