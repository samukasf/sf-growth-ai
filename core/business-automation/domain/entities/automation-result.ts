import type {
  AutomationExecutionId,
  AutomationResultId,
  OrganizationId,
} from "../../shared";

export type ResultStatus = "success" | "partial" | "failure";

export type AutomationResultProps = {
  id: AutomationResultId;
  organizationId: OrganizationId;
  executionId: AutomationExecutionId;
  status: ResultStatus;
  actionsExecuted: number;
  actionsFailed: number;
  output: Record<string, string>;
  completedAt: string;
};

export class AutomationResult {
  readonly id: AutomationResultId;
  readonly organizationId: OrganizationId;
  readonly executionId: AutomationExecutionId;
  readonly status: ResultStatus;
  readonly actionsExecuted: number;
  readonly actionsFailed: number;
  readonly output: Record<string, string>;
  readonly completedAt: string;

  private constructor(props: AutomationResultProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.executionId = props.executionId;
    this.status = props.status;
    this.actionsExecuted = props.actionsExecuted;
    this.actionsFailed = props.actionsFailed;
    this.output = { ...props.output };
    this.completedAt = props.completedAt;
  }

  static create(
    props: Omit<AutomationResultProps, "id" | "completedAt"> & {
      id?: AutomationResultId;
      completedAt?: string;
    },
  ): AutomationResult {
    return new AutomationResult({
      id: props.id ?? `result-${Date.now()}`,
      organizationId: props.organizationId,
      executionId: props.executionId,
      status: props.status,
      actionsExecuted: props.actionsExecuted,
      actionsFailed: props.actionsFailed,
      output: props.output,
      completedAt: props.completedAt ?? new Date().toISOString(),
    });
  }

  toJSON(): AutomationResultProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      executionId: this.executionId,
      status: this.status,
      actionsExecuted: this.actionsExecuted,
      actionsFailed: this.actionsFailed,
      output: { ...this.output },
      completedAt: this.completedAt,
    };
  }
}
