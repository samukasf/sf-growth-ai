import type { Automation, AutomationExecution } from "../entities";

export type ExecutionContext = {
  triggerType: string;
  payload: Record<string, string>;
};

export type ExecutionOutcome = {
  execution: AutomationExecution;
  success: boolean;
  message: string;
};

export interface ExecutionEngine {
  start(automation: Automation, context: ExecutionContext): AutomationExecution;
  run(
    automation: Automation,
    execution: AutomationExecution,
    context: Record<string, string>,
  ): Promise<ExecutionOutcome>;
}
