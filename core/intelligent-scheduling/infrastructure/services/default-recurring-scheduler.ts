import { Appointment, type RecurringSchedule, type RecurringScheduler } from "../../domain";

const DAY_MS = 24 * 60 * 60 * 1000;

export class DefaultRecurringScheduler implements RecurringScheduler {
  generateInstances(schedule: RecurringSchedule, fromDate: string, toDate: string) {
    const instances = [];
    const from = new Date(fromDate).getTime();
    const to = new Date(toDate).getTime();
    let cursor = new Date(schedule.startDate).getTime();

    const step =
      schedule.frequency === "daily"
        ? DAY_MS
        : schedule.frequency === "weekly"
          ? 7 * DAY_MS
          : schedule.frequency === "biweekly"
            ? 14 * DAY_MS
            : 30 * DAY_MS;

    while (cursor <= to) {
      if (cursor >= from) {
        const start = new Date(cursor);
        const [h, m] = schedule.startTime.split(":").map(Number);
        start.setHours(h ?? 9, m ?? 0, 0, 0);
        const end = new Date(start.getTime() + schedule.durationMinutes * 60 * 1000);
        instances.push({
          startAt: start.toISOString(),
          endAt: end.toISOString(),
          recurringScheduleId: schedule.id,
        });
      }
      cursor += step;
    }

    return instances;
  }

  toAppointments(
    schedule: RecurringSchedule,
    instances: Array<{ startAt: string; endAt: string; recurringScheduleId: string }>,
  ) {
    return instances.map((instance) =>
      Appointment.create({
        organizationId: schedule.organizationId,
        calendarId: schedule.calendarId,
        serviceId: schedule.serviceId,
        title: schedule.title,
        description: `Recorrente: ${schedule.frequency}`,
        startAt: instance.startAt,
        endAt: instance.endAt,
        autoConfirm: false,
        autoCheckIn: false,
      }),
    );
  }
}
