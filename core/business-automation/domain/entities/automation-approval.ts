import type {
  AutomationApprovalId,
  AutomationExecutionId,
  AutomationId,
  OrganizationId,
} from "../../shared";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type AutomationApprovalProps = {
  id: AutomationApprovalId;
  organizationId: OrganizationId;
  automationId: AutomationId;
  executionId: AutomationExecutionId;
  title: string;
  justification: string;
  status: ApprovalStatus;
  requestedAt: string;
  resolvedAt?: string;
  approverId?: string;
};

export class AutomationApproval {
  readonly id: AutomationApprovalId;
  readonly organizationId: OrganizationId;
  readonly automationId: AutomationId;
  readonly executionId: AutomationExecutionId;
  readonly title: string;
  readonly justification: string;
  readonly status: ApprovalStatus;
  readonly requestedAt: string;
  readonly resolvedAt?: string;
  readonly approverId?: string;

  private constructor(props: AutomationApprovalProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.automationId = props.automationId;
    this.executionId = props.executionId;
    this.title = props.title;
    this.justification = props.justification;
    this.status = props.status;
    this.requestedAt = props.requestedAt;
    this.resolvedAt = props.resolvedAt;
    this.approverId = props.approverId;
  }

  static create(
    props: Omit<AutomationApprovalProps, "id" | "requestedAt" | "status"> & {
      id?: AutomationApprovalId;
      requestedAt?: string;
      status?: ApprovalStatus;
    },
  ): AutomationApproval {
    return new AutomationApproval({
      id: props.id ?? `approval-${Date.now()}`,
      organizationId: props.organizationId,
      automationId: props.automationId,
      executionId: props.executionId,
      title: props.title.trim(),
      justification: props.justification.trim(),
      status: props.status ?? "pending",
      requestedAt: props.requestedAt ?? new Date().toISOString(),
      resolvedAt: props.resolvedAt,
      approverId: props.approverId,
    });
  }

  approve(approverId: string): AutomationApproval {
    return new AutomationApproval({
      ...this.toJSON(),
      status: "approved",
      approverId,
      resolvedAt: new Date().toISOString(),
    });
  }

  toJSON(): AutomationApprovalProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      automationId: this.automationId,
      executionId: this.executionId,
      title: this.title,
      justification: this.justification,
      status: this.status,
      requestedAt: this.requestedAt,
      resolvedAt: this.resolvedAt,
      approverId: this.approverId,
    };
  }
}
