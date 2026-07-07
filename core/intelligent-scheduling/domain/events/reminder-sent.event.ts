import { createDomainEvent, type DomainEvent } from "../../shared";
import type { AppointmentReminder } from "../entities";

export type ReminderSentPayload = {
  reminder: ReturnType<AppointmentReminder["toJSON"]>;
};
export type ReminderSentEvent = DomainEvent<ReminderSentPayload>;

export function createReminderSentEvent(reminder: AppointmentReminder): ReminderSentEvent {
  return createDomainEvent({
    eventType: "ReminderSent",
    aggregateId: reminder.appointmentId,
    organizationId: reminder.organizationId,
    payload: { reminder: reminder.toJSON() },
  });
}
