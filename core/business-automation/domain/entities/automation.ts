import type { AutomationId, AutomationWorkflowId, OrganizationId } from "../../shared";

export type AutomationStatus = "draft" | "active" | "paused" | "archived";

export type AutomationProps = {
  id: AutomationId;
  organizationId: OrganizationId;
  workflowId: AutomationWorkflowId;
  name: string;
  description: string;
  module: string;
  status: AutomationStatus;
  requiresApproval: boolean;
  createdAt: string;
  updatedAt: string;
};

export class Automation {
  readonly id: AutomationId;
  readonly organizationId: OrganizationId;
  readonly workflowId: AutomationWorkflowId;
  readonly name: string;
  readonly description: string;
  readonly module: string;
  readonly status: AutomationStatus;
  readonly requiresApproval: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(props: AutomationProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.workflowId = props.workflowId;
    this.name = props.name;
    this.description = props.description;
    this.module = props.module;
    this.status = props.status;
    this.requiresApproval = props.requiresApproval;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<AutomationProps, "id" | "createdAt" | "updatedAt" | "status"> & {
      id?: AutomationId;
      createdAt?: string;
      updatedAt?: string;
      status?: AutomationStatus;
    },
  ): Automation {
    if (!props.name.trim()) throw new Error("name is required");

    const now = new Date().toISOString();
    return new Automation({
      id: props.id ?? `auto-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      workflowId: props.workflowId,
      name: props.name.trim(),
      description: props.description.trim(),
      module: props.module.trim(),
      status: props.status ?? "draft",
      requiresApproval: props.requiresApproval,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  activate(): Automation {
    return Automation.create({ ...this.toJSON(), status: "active", updatedAt: new Date().toISOString() });
  }

  toJSON(): AutomationProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      workflowId: this.workflowId,
      name: this.name,
      description: this.description,
      module: this.module,
      status: this.status,
      requiresApproval: this.requiresApproval,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
