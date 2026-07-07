import type { AutomationSchedule, ScheduleEngine } from "../../domain";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export class DefaultScheduleEngine implements ScheduleEngine {
  evaluate(schedules: AutomationSchedule[]) {
    const now = Date.now();
    return schedules.map((schedule) => {
      if (!schedule.active) {
        return { schedule, due: false };
      }

      const due = schedule.nextRunAt ? new Date(schedule.nextRunAt).getTime() <= now : false;
      return {
        schedule,
        due,
        nextRunAt: this.computeNextRun(schedule),
      };
    });
  }

  computeNextRun(schedule: AutomationSchedule): string | undefined {
    if (!schedule.active) return undefined;

    const now = Date.now();
    switch (schedule.frequency) {
      case "once":
        return new Date(now + HOUR_MS).toISOString();
      case "hourly":
        return new Date(now + HOUR_MS).toISOString();
      case "daily":
        return new Date(now + DAY_MS).toISOString();
      case "weekly":
        return new Date(now + 7 * DAY_MS).toISOString();
      case "monthly":
        return new Date(now + 30 * DAY_MS).toISOString();
      case "cron":
        return schedule.cronExpression
          ? new Date(now + HOUR_MS).toISOString()
          : undefined;
      default:
        return undefined;
    }
  }
}
