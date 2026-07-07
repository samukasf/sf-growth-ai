import type { OrganizationId, ParticipantId } from "../../shared";

export type ParticipantRole = "customer" | "agent" | "bot" | "system";

export type ParticipantProps = {
  id: ParticipantId;
  organizationId: OrganizationId;
  name: string;
  email?: string;
  phone?: string;
  externalId?: string;
  role: ParticipantRole;
  channelIdentifier: string;
};

export class Participant {
  readonly id: ParticipantId;
  readonly organizationId: OrganizationId;
  readonly name: string;
  readonly email?: string;
  readonly phone?: string;
  readonly externalId?: string;
  readonly role: ParticipantRole;
  readonly channelIdentifier: string;

  private constructor(props: ParticipantProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.name = props.name;
    this.email = props.email;
    this.phone = props.phone;
    this.externalId = props.externalId;
    this.role = props.role;
    this.channelIdentifier = props.channelIdentifier;
  }

  static create(
    props: Omit<ParticipantProps, "id"> & { id?: ParticipantId },
  ): Participant {
    return new Participant({
      id: props.id ?? `participant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      name: props.name.trim(),
      email: props.email,
      phone: props.phone,
      externalId: props.externalId,
      role: props.role,
      channelIdentifier: props.channelIdentifier.trim(),
    });
  }

  toJSON(): ParticipantProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      name: this.name,
      email: this.email,
      phone: this.phone,
      externalId: this.externalId,
      role: this.role,
      channelIdentifier: this.channelIdentifier,
    };
  }
}
