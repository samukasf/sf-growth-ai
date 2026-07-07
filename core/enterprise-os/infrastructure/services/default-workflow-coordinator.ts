import type { BusinessWorkflow, WorkflowCoordinator } from "../../domain";

export class DefaultWorkflowCoordinator implements WorkflowCoordinator {
  start(workflow: BusinessWorkflow) {
    return workflow.start();
  }

  complete(workflow: BusinessWorkflow) {
    const completed = workflow.complete();
    return {
      workflow: completed,
      success: true,
      message: "Workflow completed (simulated)",
    };
  }

  async coordinate(workflow: BusinessWorkflow) {
    const completedSteps = workflow.steps.map((step) => ({
      ...step,
      status: "completed" as const,
    }));

    const completed = BusinessWorkflow.create({
      ...workflow.toJSON(),
      steps: completedSteps,
      status: "completed",
      completedAt: new Date().toISOString(),
    });

    return {
      workflow: completed,
      success: true,
      message: `Coordinated ${completedSteps.length} steps across platforms (simulated)`,
    };
  }
}
