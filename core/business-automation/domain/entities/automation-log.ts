import type {
  AutomationExecutionId,
  AutomationLogId,
  OrganizationId,
} from "../../shared";

export type LogLevel = "info" | "warn" | "error" | "debug";

export type AutomationLogProps = {
  id: AutomationLogId;
  organizationId: OrganizationId;
  executionId: AutomationExecutionId;
  level: LogLevel;
  message: string;
  module: string;
  metadata: Record<string, string>;
  occurredAt: string;
};

export class AutomationLog {
  readonly id: AutomationLogId;
  readonly organizationId: OrganizationId;
  readonly executionId: AutomationExecutionId;
  readonly level: LogLevel;
  readonly message: string;
  readonly module: string;
  readonly metadata: Record<string, string>;
  readonly occurredAt: string;

  private constructor(props: AutomationLogProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.executionId = props.executionId;
    this.level = props.level;
    this.message = props.message;
    this.module = props.module;
    this.metadata = { ...props.metadata };
    this.occurredAt = props.occurredAt;
  }

  static create(
    props: Omit<AutomationLogProps, "id" | "occurredAt"> & {
      id?: AutomationLogId;
      occurredAt?: string;
    },
  ): AutomationLog {
    return new AutomationLog({
      id: props.id ?? `log-${Date.now()}`,
      organizationId: props.organizationId,
      executionId: props.executionId,
      level: props.level,
      message: props.message.trim(),
      module: props.module.trim(),
      metadata: props.metadata,
      occurredAt: props.occurredAt ?? new Date().toISOString(),
    });
  }

  toJSON(): AutomationLogProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      executionId: this.executionId,
      level: this.level,
      message: this.message,
      module: this.module,
      metadata: { ...this.metadata },
      occurredAt: this.occurredAt,
    };
  }
}
