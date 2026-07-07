import type { Appointment, RecurringSchedule } from "../entities";

export type RecurrenceInstance = {
  startAt: string;
  endAt: string;
  recurringScheduleId: string;
};

export interface RecurringScheduler {
  generateInstances(
    schedule: RecurringSchedule,
    fromDate: string,
    toDate: string,
  ): RecurrenceInstance[];
  toAppointments(
    schedule: RecurringSchedule,
    instances: RecurrenceInstance[],
  ): Appointment[];
}
