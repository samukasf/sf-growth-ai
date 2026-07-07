import { AutomationNotFoundError } from "../../shared";
import {
  AutomationResult,
  createAutomationCompletedEvent,
  createAutomationExecutedEvent,
  createAutomationFailedEvent,
} from "../../domain";
import type { ExecuteAutomationDto } from "../dto";
import type { BusinessAutomationDependencies } from "../dependencies";

export class ExecuteAutomationUseCase {
  constructor(private readonly deps: BusinessAutomationDependencies) {}

  async execute(dto: ExecuteAutomationDto) {
    const automation = await this.deps.automationRepository.findById(dto.automationId);
    if (!automation) throw new AutomationNotFoundError(dto.automationId);

    const triggers = await this.deps.workflowRepository.findTriggersByWorkflow(
      automation.workflowId,
    );
    const matches = this.deps.triggerEngine.match(triggers, dto.triggerType, dto.context);
    const activeMatch = matches.find((m) => m.matched);

    if (!activeMatch) {
      return { executed: false, reason: "No matching trigger" };
    }

    const conditions = await this.deps.workflowRepository.findConditionsByWorkflow(
      automation.workflowId,
    );
    const conditionResult = this.deps.conditionEngine.evaluate(conditions, dto.context);
    if (!conditionResult.passed) {
      return { executed: false, reason: "Conditions not met", conditionResult };
    }

    const execution = this.deps.executionEngine.start(automation, {
      triggerType: dto.triggerType,
      payload: dto.context,
    });
    await this.deps.automationRepository.saveExecution(execution);
    await this.deps.eventDispatcher.publish(createAutomationExecutedEvent(execution));

    this.deps.auditEngine.record({
      executionId: execution.id,
      organizationId: dto.organizationId,
      module: automation.module,
      message: "Execution started",
      metadata: { triggerType: dto.triggerType },
    });

    const actions = await this.deps.workflowRepository.findActionsByWorkflow(
      automation.workflowId,
    );

    const needsApproval = automation.requiresApproval ||
      actions.some((a) => this.deps.approvalEngine.isRequired(automation.requiresApproval, a.type));

    if (needsApproval) {
      const approval = this.deps.approvalEngine.request({
        automationId: automation.id,
        executionId: execution.id,
        organizationId: dto.organizationId,
        title: `Approval for ${automation.name}`,
        justification: "Automation requires approval before action execution",
      });
      await this.deps.automationRepository.saveApproval(approval);
      return { executed: false, pendingApproval: true, execution, approval };
    }

    const outcome = await this.deps.executionEngine.run(automation, execution, dto.context);
    await this.deps.automationRepository.saveExecution(outcome.execution);

    const actionPlans = await this.deps.actionEngine.execute(actions, dto.context);
    const executed = actionPlans.filter((p) => p.status === "executed").length;
    const failed = actionPlans.filter((p) => p.status === "failed").length;

    if (!outcome.success) {
      await this.deps.eventDispatcher.publish(
        createAutomationFailedEvent({
          automationId: automation.id,
          organizationId: dto.organizationId,
          executionId: execution.id,
          errorMessage: outcome.message,
        }),
      );
      return { executed: false, execution: outcome.execution, actionPlans };
    }

    const result = AutomationResult.create({
      organizationId: dto.organizationId,
      executionId: execution.id,
      status: failed > 0 ? "partial" : "success",
      actionsExecuted: executed,
      actionsFailed: failed,
      output: { message: outcome.message },
    });

    await this.deps.automationRepository.saveResult(result);
    await this.deps.eventDispatcher.publish(createAutomationCompletedEvent(result));

    return { executed: true, execution: outcome.execution, actionPlans, result };
  }
}
