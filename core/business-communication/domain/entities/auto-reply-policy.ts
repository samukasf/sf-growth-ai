import type { AutoReplyPolicyId, OrganizationId } from "../../shared";
import type { ChannelType } from "./communication-channel";

export type AutonomyLevel = 1 | 2 | 3 | 4;

export type AutoReplyPolicyProps = {
  id: AutoReplyPolicyId;
  organizationId: OrganizationId;
  name: string;
  channelTypes: ChannelType[];
  autonomyLevel: AutonomyLevel;
  requiresApproval: boolean;
  template: string;
  active: boolean;
};

export class AutoReplyPolicy {
  readonly id: AutoReplyPolicyId;
  readonly organizationId: OrganizationId;
  readonly name: string;
  readonly channelTypes: ChannelType[];
  readonly autonomyLevel: AutonomyLevel;
  readonly requiresApproval: boolean;
  readonly template: string;
  readonly active: boolean;

  private constructor(props: AutoReplyPolicyProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.name = props.name;
    this.channelTypes = [...props.channelTypes];
    this.autonomyLevel = props.autonomyLevel;
    this.requiresApproval = props.requiresApproval;
    this.template = props.template;
    this.active = props.active;
  }

  static create(
    props: Omit<AutoReplyPolicyProps, "id"> & { id?: AutoReplyPolicyId },
  ): AutoReplyPolicy {
    return new AutoReplyPolicy({
      id: props.id ?? `policy-${Date.now()}`,
      organizationId: props.organizationId,
      name: props.name.trim(),
      channelTypes: props.channelTypes,
      autonomyLevel: props.autonomyLevel,
      requiresApproval: props.requiresApproval,
      template: props.template,
      active: props.active,
    });
  }

  toJSON(): AutoReplyPolicyProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      name: this.name,
      channelTypes: [...this.channelTypes],
      autonomyLevel: this.autonomyLevel,
      requiresApproval: this.requiresApproval,
      template: this.template,
      active: this.active,
    };
  }
}
