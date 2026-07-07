import {
  createAutomationApprovedEvent,
  createAutomationCompletedEvent,
} from "../../domain";
import { AutomationResult } from "../../domain";
import type { ApproveAutomationDto } from "../dto";
import type { BusinessAutomationDependencies } from "../dependencies";

export class ApproveAutomationUseCase {
  constructor(private readonly deps: BusinessAutomationDependencies) {}

  async execute(dto: ApproveAutomationDto) {
    const approval = await this.deps.automationRepository.findApprovalById(dto.approvalId);
    if (!approval) throw new Error(`Approval not found: ${dto.approvalId}`);

    const approved = this.deps.approvalEngine.approve(approval, dto.approverId);
    await this.deps.automationRepository.saveApproval(approved);
    await this.deps.eventDispatcher.publish(createAutomationApprovedEvent(approved));

    const automation = await this.deps.automationRepository.findById(approved.automationId);
    const execution = await this.deps.automationRepository.findExecutionById(approved.executionId);

    if (automation && execution) {
      const actions = await this.deps.workflowRepository.findActionsByWorkflow(
        automation.workflowId,
      );
      const actionPlans = await this.deps.actionEngine.execute(actions, execution.context);
      const executed = actionPlans.filter((p) => p.status === "executed").length;
      const failed = actionPlans.filter((p) => p.status === "failed").length;

      const completed = execution.complete();
      await this.deps.automationRepository.saveExecution(completed);

      const result = AutomationResult.create({
        organizationId: dto.organizationId,
        executionId: execution.id,
        status: failed > 0 ? "partial" : "success",
        actionsExecuted: executed,
        actionsFailed: failed,
        output: { approvedBy: dto.approverId },
      });

      await this.deps.automationRepository.saveResult(result);
      await this.deps.eventDispatcher.publish(createAutomationCompletedEvent(result));

      return { approval: approved, execution: completed, actionPlans, result };
    }

    return { approval: approved };
  }
}
