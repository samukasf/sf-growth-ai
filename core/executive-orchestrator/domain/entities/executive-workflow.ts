import type {
  CompanyId,
  ExecutiveParticipantId,
  ExecutiveRequestId,
  ExecutiveWorkflowId,
} from "../../shared";

export type WorkflowStepStatus = "pending" | "running" | "completed" | "skipped" | "failed";

export type WorkflowStep = {
  participantId: ExecutiveParticipantId;
  order: number;
  status: WorkflowStepStatus;
  startedAt?: string;
  completedAt?: string;
};

export type WorkflowStatus = "planned" | "running" | "completed" | "failed";

export type ExecutiveWorkflowProps = {
  id: ExecutiveWorkflowId;
  companyId: CompanyId;
  requestId: ExecutiveRequestId;
  participants: ExecutiveParticipantId[];
  steps: WorkflowStep[];
  status: WorkflowStatus;
  createdAt: string;
  updatedAt: string;
};

export class ExecutiveWorkflow {
  readonly id: ExecutiveWorkflowId;
  readonly companyId: CompanyId;
  readonly requestId: ExecutiveRequestId;
  readonly participants: ExecutiveParticipantId[];
  readonly steps: WorkflowStep[];
  readonly status: WorkflowStatus;
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(props: ExecutiveWorkflowProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.requestId = props.requestId;
    this.participants = [...props.participants];
    this.steps = props.steps.map((step) => ({ ...step }));
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<ExecutiveWorkflowProps, "id" | "createdAt" | "updatedAt" | "status" | "steps"> & {
      id?: ExecutiveWorkflowId;
      createdAt?: string;
      updatedAt?: string;
      status?: WorkflowStatus;
      steps?: WorkflowStep[];
    },
  ): ExecutiveWorkflow {
    const now = new Date().toISOString();
    const steps =
      props.steps ??
      props.participants.map((participantId, index) => ({
        participantId,
        order: index + 1,
        status: "pending" as const,
      }));

    return new ExecutiveWorkflow({
      id: props.id ?? `workflow-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: props.companyId,
      requestId: props.requestId,
      participants: props.participants,
      steps,
      status: props.status ?? "planned",
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  start(): ExecutiveWorkflow {
    return ExecutiveWorkflow.create({
      ...this.toJSON(),
      status: "running",
      updatedAt: new Date().toISOString(),
      steps: this.steps.map((step, index) =>
        index === 0 ? { ...step, status: "running", startedAt: new Date().toISOString() } : step,
      ),
    });
  }

  complete(): ExecutiveWorkflow {
    return ExecutiveWorkflow.create({
      ...this.toJSON(),
      status: "completed",
      updatedAt: new Date().toISOString(),
      steps: this.steps.map((step) => ({
        ...step,
        status: step.status === "pending" ? "completed" : step.status,
        completedAt: step.completedAt ?? new Date().toISOString(),
      })),
    });
  }

  toJSON(): ExecutiveWorkflowProps {
    return {
      id: this.id,
      companyId: this.companyId,
      requestId: this.requestId,
      participants: [...this.participants],
      steps: this.steps.map((step) => ({ ...step })),
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
