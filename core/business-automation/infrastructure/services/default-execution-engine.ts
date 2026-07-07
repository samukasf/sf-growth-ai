import { AutomationExecution, type Automation, type ExecutionEngine } from "../../domain";

export class DefaultExecutionEngine implements ExecutionEngine {
  start(automation: Automation, context: { triggerType: string; payload: Record<string, string> }) {
    return AutomationExecution.create({
      organizationId: automation.organizationId,
      automationId: automation.id,
      workflowId: automation.workflowId,
      triggerType: context.triggerType,
      context: context.payload,
      status: "running",
    });
  }

  async run(
    automation: Automation,
    execution: AutomationExecution,
    context: Record<string, string>,
  ) {
    if (automation.status !== "active" && automation.status !== "draft") {
      const failed = execution.fail("Automation is not active");
      return { execution: failed, success: false, message: "Automation is not active" };
    }

    const completed = execution.complete();
    const contextSummary = Object.keys(context).join(", ") || "none";
    return {
      execution: completed,
      success: true,
      message: `Simulated workflow execution for ${automation.name} (context: ${contextSummary})`,
    };
  }
}
