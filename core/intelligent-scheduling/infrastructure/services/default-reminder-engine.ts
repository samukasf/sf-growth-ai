import { AppointmentReminder, type Appointment, type ReminderEngine } from "../../domain";

export class DefaultReminderEngine implements ReminderEngine {
  plan(appointment: Appointment, minutesBefore: number[]) {
    return minutesBefore.map((minutes) => {
      const start = new Date(appointment.startAt).getTime();
      const scheduledAt = new Date(start - minutes * 60 * 1000).toISOString();
      const reminder = AppointmentReminder.create({
        organizationId: appointment.organizationId,
        appointmentId: appointment.id,
        channel: "email",
        minutesBefore: minutes,
        scheduledAt,
      });
      return { reminder, scheduledAt };
    });
  }

  shouldSend(reminder: AppointmentReminder, now: Date): boolean {
    if (reminder.status !== "pending") return false;
    return new Date(reminder.scheduledAt).getTime() <= now.getTime();
  }
}
