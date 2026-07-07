import type { CommunicationRuleId, OrganizationId } from "../../shared";
import type { ChannelType } from "./communication-channel";

export type RuleAction = "route" | "classify" | "auto_reply" | "escalate" | "notify";

export type CommunicationRuleProps = {
  id: CommunicationRuleId;
  organizationId: OrganizationId;
  name: string;
  channelTypes: ChannelType[];
  condition: string;
  action: RuleAction;
  priority: number;
  active: boolean;
};

export class CommunicationRule {
  readonly id: CommunicationRuleId;
  readonly organizationId: OrganizationId;
  readonly name: string;
  readonly channelTypes: ChannelType[];
  readonly condition: string;
  readonly action: RuleAction;
  readonly priority: number;
  readonly active: boolean;

  private constructor(props: CommunicationRuleProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.name = props.name;
    this.channelTypes = [...props.channelTypes];
    this.condition = props.condition;
    this.action = props.action;
    this.priority = props.priority;
    this.active = props.active;
  }

  static create(
    props: Omit<CommunicationRuleProps, "id"> & { id?: CommunicationRuleId },
  ): CommunicationRule {
    return new CommunicationRule({
      id: props.id ?? `rule-${Date.now()}`,
      organizationId: props.organizationId,
      name: props.name.trim(),
      channelTypes: props.channelTypes,
      condition: props.condition.trim(),
      action: props.action,
      priority: props.priority,
      active: props.active,
    });
  }

  toJSON(): CommunicationRuleProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      name: this.name,
      channelTypes: [...this.channelTypes],
      condition: this.condition,
      action: this.action,
      priority: this.priority,
      active: this.active,
    };
  }
}
