import { createDomainEvent, type DomainEvent } from "../../shared";
import type { Appointment } from "../entities";

export type AppointmentCompletedPayload = {
  appointment: ReturnType<Appointment["toJSON"]>;
};
export type AppointmentCompletedEvent = DomainEvent<AppointmentCompletedPayload>;

export function createAppointmentCompletedEvent(
  appointment: Appointment,
): AppointmentCompletedEvent {
  return createDomainEvent({
    eventType: "AppointmentCompleted",
    aggregateId: appointment.id,
    organizationId: appointment.organizationId,
    payload: { appointment: appointment.toJSON() },
  });
}
