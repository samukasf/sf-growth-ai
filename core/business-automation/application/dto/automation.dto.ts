import type {
  ActionType,
  ScheduleFrequency,
  TriggerType,
  WorkflowNode,
} from "../../domain";

export type CreateAutomationDto = {
  organizationId: string;
  name: string;
  description: string;
  module: string;
  requiresApproval: boolean;
  workflow: {
    name: string;
    description: string;
    visualLayout: "linear" | "graph";
    nodes: WorkflowNode[];
    entryNodeId: string;
    triggers: Array<{
      type: TriggerType;
      name: string;
      config: Record<string, string>;
      active: boolean;
    }>;
    conditions: Array<{
      field: string;
      operator: "equals" | "not_equals" | "contains" | "greater_than" | "less_than";
      value: string;
      logicalGroup?: string;
    }>;
    actions: Array<{
      type: ActionType;
      name: string;
      config: Record<string, string>;
      order: number;
    }>;
  };
};

export type ExecuteAutomationDto = {
  organizationId: string;
  automationId: string;
  triggerType: TriggerType;
  context: Record<string, string>;
};

export type ApproveAutomationDto = {
  organizationId: string;
  approvalId: string;
  approverId: string;
};

export type CancelAutomationDto = {
  organizationId: string;
  executionId: string;
};

export type ScheduleAutomationDto = {
  organizationId: string;
  workflowId: string;
  name: string;
  frequency: ScheduleFrequency;
  cronExpression?: string;
  active: boolean;
};
