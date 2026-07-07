import type { Appointment, AppointmentReminder } from "../entities";

export type ReminderPlan = {
  reminder: AppointmentReminder;
  scheduledAt: string;
};

export interface ReminderEngine {
  plan(appointment: Appointment, minutesBefore: number[]): ReminderPlan[];
  shouldSend(reminder: AppointmentReminder, now: Date): boolean;
}
