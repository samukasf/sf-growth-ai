import type { AutomationTriggerId, AutomationWorkflowId, OrganizationId } from "../../shared";

export type TriggerType =
  | "event"
  | "schedule"
  | "status_change"
  | "email_received"
  | "whatsapp_received"
  | "new_lead"
  | "new_customer"
  | "new_order"
  | "new_payment"
  | "document_created"
  | "external_api"
  | "manual";

export type AutomationTriggerProps = {
  id: AutomationTriggerId;
  organizationId: OrganizationId;
  workflowId: AutomationWorkflowId;
  type: TriggerType;
  name: string;
  config: Record<string, string>;
  active: boolean;
};

export class AutomationTrigger {
  readonly id: AutomationTriggerId;
  readonly organizationId: OrganizationId;
  readonly workflowId: AutomationWorkflowId;
  readonly type: TriggerType;
  readonly name: string;
  readonly config: Record<string, string>;
  readonly active: boolean;

  private constructor(props: AutomationTriggerProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.workflowId = props.workflowId;
    this.type = props.type;
    this.name = props.name;
    this.config = { ...props.config };
    this.active = props.active;
  }

  static create(
    props: Omit<AutomationTriggerProps, "id"> & { id?: AutomationTriggerId },
  ): AutomationTrigger {
    return new AutomationTrigger({
      id: props.id ?? `trigger-${Date.now()}`,
      organizationId: props.organizationId,
      workflowId: props.workflowId,
      type: props.type,
      name: props.name.trim(),
      config: props.config,
      active: props.active,
    });
  }

  toJSON(): AutomationTriggerProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      workflowId: this.workflowId,
      type: this.type,
      name: this.name,
      config: { ...this.config },
      active: this.active,
    };
  }
}
