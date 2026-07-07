import type { AutomationActionId, AutomationWorkflowId, OrganizationId } from "../../shared";

export type ActionType =
  | "send_email"
  | "send_whatsapp"
  | "create_task"
  | "create_project"
  | "update_crm"
  | "update_pipeline"
  | "create_appointment"
  | "generate_document"
  | "request_approval"
  | "execute_api"
  | "notify_user";

export type AutomationActionProps = {
  id: AutomationActionId;
  organizationId: OrganizationId;
  workflowId: AutomationWorkflowId;
  type: ActionType;
  name: string;
  config: Record<string, string>;
  order: number;
};

export class AutomationAction {
  readonly id: AutomationActionId;
  readonly organizationId: OrganizationId;
  readonly workflowId: AutomationWorkflowId;
  readonly type: ActionType;
  readonly name: string;
  readonly config: Record<string, string>;
  readonly order: number;

  private constructor(props: AutomationActionProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.workflowId = props.workflowId;
    this.type = props.type;
    this.name = props.name;
    this.config = { ...props.config };
    this.order = props.order;
  }

  static create(
    props: Omit<AutomationActionProps, "id"> & { id?: AutomationActionId },
  ): AutomationAction {
    return new AutomationAction({
      id: props.id ?? `action-${Date.now()}`,
      organizationId: props.organizationId,
      workflowId: props.workflowId,
      type: props.type,
      name: props.name.trim(),
      config: props.config,
      order: props.order,
    });
  }

  toJSON(): AutomationActionProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      workflowId: this.workflowId,
      type: this.type,
      name: this.name,
      config: { ...this.config },
      order: this.order,
    };
  }
}
