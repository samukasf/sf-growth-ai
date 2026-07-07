import type { AutomationSchedule } from "../entities";

export type ScheduleEvaluation = {
  schedule: AutomationSchedule;
  due: boolean;
  nextRunAt?: string;
};

export interface ScheduleEngine {
  evaluate(schedules: AutomationSchedule[]): ScheduleEvaluation[];
  computeNextRun(schedule: AutomationSchedule): string | undefined;
}
