export type MultiToolTaskStepStatus = "pending" | "success" | "error" | "skipped";

export type MultiToolTaskStepPlan = {
  id: string;
  toolName: string;
  input: Record<string, unknown>;
  reason: string;
  /** IDs de etapas que devem ter sucesso antes desta ser executada. */
  dependsOn?: string[];
};

export type MultiToolTaskPlan =
  | { selected: false }
  | {
      selected: true;
      summary: string;
      steps: MultiToolTaskStepPlan[];
    };

export type MultiToolTaskStepResult = {
  id: string;
  toolName: string;
  actionId?: string;
  reason: string;
  input: Record<string, unknown>;
  status: MultiToolTaskStepStatus;
  output?: unknown;
  error?: string;
  durationMs?: number;
};

export type MultiToolTaskExecutionResult = {
  enabled: boolean;
  attempted: boolean;
  overallStatus: "none" | "success" | "partial" | "error";
  summary?: string;
  steps: MultiToolTaskStepResult[];
  totalDurationMs: number;
};

export type MultiToolTaskExecutionContext = {
  organizationId: string;
  companyId: string;
};

export type StepOutputContext = {
  output?: unknown;
  status: MultiToolTaskStepStatus;
};
