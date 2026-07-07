import type { BusinessWorkflowId, OrganizationId } from "../../shared";

export type WorkflowStatus = "pending" | "running" | "completed" | "failed" | "cancelled";

export type WorkflowStep = {
  id: string;
  platformId: string;
  capabilityId: string;
  action: string;
  status: "pending" | "completed" | "failed" | "skipped";
};

export type BusinessWorkflowProps = {
  id: BusinessWorkflowId;
  organizationId: OrganizationId;
  name: string;
  description: string;
  contextId: string;
  steps: WorkflowStep[];
  status: WorkflowStatus;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
};

export class BusinessWorkflow {
  readonly id: BusinessWorkflowId;
  readonly organizationId: OrganizationId;
  readonly name: string;
  readonly description: string;
  readonly contextId: string;
  readonly steps: WorkflowStep[];
  readonly status: WorkflowStatus;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly createdAt: string;

  private constructor(props: BusinessWorkflowProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.name = props.name;
    this.description = props.description;
    this.contextId = props.contextId;
    this.steps = props.steps.map((s) => ({ ...s }));
    this.status = props.status;
    this.startedAt = props.startedAt;
    this.completedAt = props.completedAt;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<BusinessWorkflowProps, "id" | "createdAt" | "status"> & {
      id?: BusinessWorkflowId;
      createdAt?: string;
      status?: WorkflowStatus;
    },
  ): BusinessWorkflow {
    return new BusinessWorkflow({
      id: props.id ?? `workflow-${Date.now()}`,
      organizationId: props.organizationId,
      name: props.name.trim(),
      description: props.description.trim(),
      contextId: props.contextId,
      steps: props.steps,
      status: props.status ?? "pending",
      startedAt: props.startedAt,
      completedAt: props.completedAt,
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  start(): BusinessWorkflow {
    return BusinessWorkflow.create({
      ...this.toJSON(),
      status: "running",
      startedAt: new Date().toISOString(),
    });
  }

  complete(): BusinessWorkflow {
    return BusinessWorkflow.create({
      ...this.toJSON(),
      status: "completed",
      completedAt: new Date().toISOString(),
    });
  }

  toJSON(): BusinessWorkflowProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      name: this.name,
      description: this.description,
      contextId: this.contextId,
      steps: this.steps.map((s) => ({ ...s })),
      status: this.status,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      createdAt: this.createdAt,
    };
  }
}
