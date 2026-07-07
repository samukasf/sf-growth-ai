import type { AutomationWorkflowId, OrganizationId } from "../../shared";

export type WorkflowNodeType = "trigger" | "condition" | "action" | "approval";

export type WorkflowNode = {
  id: string;
  type: WorkflowNodeType;
  label: string;
  position: { x: number; y: number };
  config: Record<string, string>;
  nextNodeIds: string[];
};

export type AutomationWorkflowProps = {
  id: AutomationWorkflowId;
  organizationId: OrganizationId;
  name: string;
  description: string;
  version: number;
  nodes: WorkflowNode[];
  entryNodeId: string;
  visualLayout: "linear" | "graph";
  createdAt: string;
  updatedAt: string;
};

export class AutomationWorkflow {
  readonly id: AutomationWorkflowId;
  readonly organizationId: OrganizationId;
  readonly name: string;
  readonly description: string;
  readonly version: number;
  readonly nodes: WorkflowNode[];
  readonly entryNodeId: string;
  readonly visualLayout: "linear" | "graph";
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(props: AutomationWorkflowProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.name = props.name;
    this.description = props.description;
    this.version = props.version;
    this.nodes = props.nodes.map((n) => ({
      ...n,
      config: { ...n.config },
      nextNodeIds: [...n.nextNodeIds],
    }));
    this.entryNodeId = props.entryNodeId;
    this.visualLayout = props.visualLayout;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<AutomationWorkflowProps, "id" | "createdAt" | "updatedAt" | "version"> & {
      id?: AutomationWorkflowId;
      createdAt?: string;
      updatedAt?: string;
      version?: number;
    },
  ): AutomationWorkflow {
    const now = new Date().toISOString();
    return new AutomationWorkflow({
      id: props.id ?? `workflow-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      name: props.name.trim(),
      description: props.description.trim(),
      version: props.version ?? 1,
      nodes: props.nodes,
      entryNodeId: props.entryNodeId,
      visualLayout: props.visualLayout,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  toJSON(): AutomationWorkflowProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      name: this.name,
      description: this.description,
      version: this.version,
      nodes: this.nodes.map((n) => ({
        ...n,
        config: { ...n.config },
        nextNodeIds: [...n.nextNodeIds],
      })),
      entryNodeId: this.entryNodeId,
      visualLayout: this.visualLayout,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
