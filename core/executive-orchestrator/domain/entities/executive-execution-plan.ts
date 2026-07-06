import type {
  CompanyId,
  ExecutiveExecutionPlanId,
  ExecutiveParticipantId,
  ExecutiveRequestId,
} from "../../shared";

export type ExecutionAction = {
  participantId: ExecutiveParticipantId;
  action: string;
  order: number;
  estimatedDays: number;
};

export type ExecutiveExecutionPlanProps = {
  id: ExecutiveExecutionPlanId;
  companyId: CompanyId;
  requestId: ExecutiveRequestId;
  summary: string;
  actions: ExecutionAction[];
  totalEstimatedDays: number;
  createdAt: string;
};

export class ExecutiveExecutionPlan {
  readonly id: ExecutiveExecutionPlanId;
  readonly companyId: CompanyId;
  readonly requestId: ExecutiveRequestId;
  readonly summary: string;
  readonly actions: ExecutionAction[];
  readonly totalEstimatedDays: number;
  readonly createdAt: string;

  private constructor(props: ExecutiveExecutionPlanProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.requestId = props.requestId;
    this.summary = props.summary;
    this.actions = props.actions.map((a) => ({ ...a }));
    this.totalEstimatedDays = props.totalEstimatedDays;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<ExecutiveExecutionPlanProps, "id" | "createdAt" | "totalEstimatedDays"> & {
      id?: ExecutiveExecutionPlanId;
      createdAt?: string;
    },
  ): ExecutiveExecutionPlan {
    const totalEstimatedDays = props.actions.reduce((sum, a) => sum + a.estimatedDays, 0);

    return new ExecutiveExecutionPlan({
      id: props.id ?? `exec-plan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: props.companyId,
      requestId: props.requestId,
      summary: props.summary.trim(),
      actions: props.actions,
      totalEstimatedDays,
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  toJSON(): ExecutiveExecutionPlanProps {
    return {
      id: this.id,
      companyId: this.companyId,
      requestId: this.requestId,
      summary: this.summary,
      actions: this.actions.map((a) => ({ ...a })),
      totalEstimatedDays: this.totalEstimatedDays,
      createdAt: this.createdAt,
    };
  }
}
