import type { BusinessWorkflow } from "../entities";

export type WorkflowCoordinationResult = {
  workflow: BusinessWorkflow;
  success: boolean;
  message: string;
};

export interface WorkflowCoordinator {
  start(workflow: BusinessWorkflow): BusinessWorkflow;
  complete(workflow: BusinessWorkflow): WorkflowCoordinationResult;
  coordinate(workflow: BusinessWorkflow): Promise<WorkflowCoordinationResult>;
}
