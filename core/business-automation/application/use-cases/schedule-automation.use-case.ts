import { AutomationSchedule } from "../../domain";
import type { ScheduleAutomationDto } from "../dto";
import type { BusinessAutomationDependencies } from "../dependencies";

export class ScheduleAutomationUseCase {
  constructor(private readonly deps: BusinessAutomationDependencies) {}

  async execute(dto: ScheduleAutomationDto) {
    const nextRunAt = this.deps.scheduleEngine.computeNextRun(
      AutomationSchedule.create({
        organizationId: dto.organizationId,
        workflowId: dto.workflowId,
        name: dto.name,
        frequency: dto.frequency,
        cronExpression: dto.cronExpression,
        active: dto.active,
      }),
    );

    const schedule = AutomationSchedule.create({
      organizationId: dto.organizationId,
      workflowId: dto.workflowId,
      name: dto.name,
      frequency: dto.frequency,
      cronExpression: dto.cronExpression,
      nextRunAt,
      active: dto.active,
    });

    await this.deps.automationRepository.saveSchedule(schedule);
    return schedule;
  }
}
