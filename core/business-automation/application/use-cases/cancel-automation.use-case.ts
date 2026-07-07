import { createAutomationCancelledEvent } from "../../domain";
import type { CancelAutomationDto } from "../dto";
import type { BusinessAutomationDependencies } from "../dependencies";

export class CancelAutomationUseCase {
  constructor(private readonly deps: BusinessAutomationDependencies) {}

  async execute(dto: CancelAutomationDto) {
    const execution = await this.deps.automationRepository.findExecutionById(dto.executionId);
    if (!execution) throw new Error(`Execution not found: ${dto.executionId}`);

    const cancelled = execution.cancel();
    await this.deps.automationRepository.saveExecution(cancelled);
    await this.deps.eventDispatcher.publish(createAutomationCancelledEvent(cancelled));

    this.deps.auditEngine.record({
      executionId: cancelled.id,
      organizationId: dto.organizationId,
      module: "automation",
      message: "Execution cancelled",
      metadata: {},
    });

    return cancelled;
  }
}
