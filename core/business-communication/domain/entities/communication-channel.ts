import type { CommunicationChannelId, OrganizationId } from "../../shared";

export type ChannelType =
  | "email"
  | "whatsapp"
  | "instagram"
  | "messenger"
  | "telegram"
  | "sms"
  | "rcs"
  | "internal_chat"
  | "microsoft_teams"
  | "slack";

export type ChannelStatus = "active" | "inactive" | "pending_setup";

export type CommunicationChannelProps = {
  id: CommunicationChannelId;
  organizationId: OrganizationId;
  type: ChannelType;
  name: string;
  identifier: string;
  status: ChannelStatus;
  autonomyLevel: 1 | 2 | 3 | 4;
  createdAt: string;
};

export class CommunicationChannel {
  readonly id: CommunicationChannelId;
  readonly organizationId: OrganizationId;
  readonly type: ChannelType;
  readonly name: string;
  readonly identifier: string;
  readonly status: ChannelStatus;
  readonly autonomyLevel: 1 | 2 | 3 | 4;
  readonly createdAt: string;

  private constructor(props: CommunicationChannelProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.type = props.type;
    this.name = props.name;
    this.identifier = props.identifier;
    this.status = props.status;
    this.autonomyLevel = props.autonomyLevel;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<CommunicationChannelProps, "id" | "createdAt" | "status"> & {
      id?: CommunicationChannelId;
      createdAt?: string;
      status?: ChannelStatus;
    },
  ): CommunicationChannel {
    return new CommunicationChannel({
      id: props.id ?? `channel-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      type: props.type,
      name: props.name.trim(),
      identifier: props.identifier.trim(),
      status: props.status ?? "pending_setup",
      autonomyLevel: props.autonomyLevel,
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  toJSON(): CommunicationChannelProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      type: this.type,
      name: this.name,
      identifier: this.identifier,
      status: this.status,
      autonomyLevel: this.autonomyLevel,
      createdAt: this.createdAt,
    };
  }
}
