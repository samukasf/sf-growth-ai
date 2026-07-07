import { createDomainEvent, type DomainEvent } from "../../shared";
import type { Appointment } from "../entities";

export type AppointmentCancelledPayload = {
  appointment: ReturnType<Appointment["toJSON"]>;
  reason?: string;
};
export type AppointmentCancelledEvent = DomainEvent<AppointmentCancelledPayload>;

export function createAppointmentCancelledEvent(
  appointment: Appointment,
  reason?: string,
): AppointmentCancelledEvent {
  return createDomainEvent({
    eventType: "AppointmentCancelled",
    aggregateId: appointment.id,
    organizationId: appointment.organizationId,
    payload: { appointment: appointment.toJSON(), reason },
  });
}
