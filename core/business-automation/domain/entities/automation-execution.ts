import type {
  AutomationExecutionId,
  AutomationId,
  AutomationWorkflowId,
  OrganizationId,
} from "../../shared";

export type ExecutionStatus = "pending" | "running" | "completed" | "failed" | "cancelled";

export type AutomationExecutionProps = {
  id: AutomationExecutionId;
  organizationId: OrganizationId;
  automationId: AutomationId;
  workflowId: AutomationWorkflowId;
  status: ExecutionStatus;
  triggerType: string;
  context: Record<string, string>;
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
};

export class AutomationExecution {
  readonly id: AutomationExecutionId;
  readonly organizationId: OrganizationId;
  readonly automationId: AutomationId;
  readonly workflowId: AutomationWorkflowId;
  readonly status: ExecutionStatus;
  readonly triggerType: string;
  readonly context: Record<string, string>;
  readonly startedAt: string;
  readonly completedAt?: string;
  readonly errorMessage?: string;

  private constructor(props: AutomationExecutionProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.automationId = props.automationId;
    this.workflowId = props.workflowId;
    this.status = props.status;
    this.triggerType = props.triggerType;
    this.context = { ...props.context };
    this.startedAt = props.startedAt;
    this.completedAt = props.completedAt;
    this.errorMessage = props.errorMessage;
  }

  static create(
    props: Omit<AutomationExecutionProps, "id" | "startedAt" | "status"> & {
      id?: AutomationExecutionId;
      startedAt?: string;
      status?: ExecutionStatus;
    },
  ): AutomationExecution {
    return new AutomationExecution({
      id: props.id ?? `exec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      automationId: props.automationId,
      workflowId: props.workflowId,
      status: props.status ?? "pending",
      triggerType: props.triggerType,
      context: props.context,
      startedAt: props.startedAt ?? new Date().toISOString(),
      completedAt: props.completedAt,
      errorMessage: props.errorMessage,
    });
  }

  complete(): AutomationExecution {
    return AutomationExecution.create({
      ...this.toJSON(),
      status: "completed",
      completedAt: new Date().toISOString(),
    });
  }

  fail(errorMessage: string): AutomationExecution {
    return AutomationExecution.create({
      ...this.toJSON(),
      status: "failed",
      completedAt: new Date().toISOString(),
      errorMessage,
    });
  }

  cancel(): AutomationExecution {
    return AutomationExecution.create({
      ...this.toJSON(),
      status: "cancelled",
      completedAt: new Date().toISOString(),
    });
  }

  toJSON(): AutomationExecutionProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      automationId: this.automationId,
      workflowId: this.workflowId,
      status: this.status,
      triggerType: this.triggerType,
      context: { ...this.context },
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      errorMessage: this.errorMessage,
    };
  }
}
