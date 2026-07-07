import { createDomainEvent, type DomainEvent } from "../../shared";
import type { Appointment } from "../entities";

export type AppointmentConfirmedPayload = {
  appointment: ReturnType<Appointment["toJSON"]>;
};
export type AppointmentConfirmedEvent = DomainEvent<AppointmentConfirmedPayload>;

export function createAppointmentConfirmedEvent(
  appointment: Appointment,
): AppointmentConfirmedEvent {
  return createDomainEvent({
    eventType: "AppointmentConfirmed",
    aggregateId: appointment.id,
    organizationId: appointment.organizationId,
    payload: { appointment: appointment.toJSON() },
  });
}
