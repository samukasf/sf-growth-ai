import type { CompanyId, ExecutionHistoryId, ExperienceId } from "../../shared";

export type ExecutionHistoryProps = {
  id: ExecutionHistoryId;
  companyId: CompanyId;
  experienceId: ExperienceId;
  action: string;
  outcome: string;
  executedAt: string;
  durationMs: number;
};

export class ExecutionHistory {
  readonly id: ExecutionHistoryId;
  readonly companyId: CompanyId;
  readonly experienceId: ExperienceId;
  readonly action: string;
  readonly outcome: string;
  readonly executedAt: string;
  readonly durationMs: number;

  private constructor(props: ExecutionHistoryProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.experienceId = props.experienceId;
    this.action = props.action;
    this.outcome = props.outcome;
    this.executedAt = props.executedAt;
    this.durationMs = props.durationMs;
  }

  static create(
    props: Omit<ExecutionHistoryProps, "id" | "executedAt"> & {
      id?: ExecutionHistoryId;
      executedAt?: string;
    },
  ): ExecutionHistory {
    return new ExecutionHistory({
      id: props.id ?? `exec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: props.companyId,
      experienceId: props.experienceId,
      action: props.action.trim(),
      outcome: props.outcome.trim(),
      executedAt: props.executedAt ?? new Date().toISOString(),
      durationMs: Math.max(0, props.durationMs),
    });
  }

  toJSON(): ExecutionHistoryProps {
    return {
      id: this.id,
      companyId: this.companyId,
      experienceId: this.experienceId,
      action: this.action,
      outcome: this.outcome,
      executedAt: this.executedAt,
      durationMs: this.durationMs,
    };
  }
}
