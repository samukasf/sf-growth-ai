import type { InteractionId, OrganizationId } from "../../shared";

export type InteractionType = "call" | "email" | "whatsapp" | "meeting" | "note" | "visit";
export type InteractionDirection = "inbound" | "outbound";

export type InteractionProps = {
  id: InteractionId;
  organizationId: OrganizationId;
  entityId: string;
  entityType: "lead" | "customer" | "supplier" | "partner";
  type: InteractionType;
  direction: InteractionDirection;
  subject: string;
  summary: string;
  occurredAt: string;
  createdBy: string;
};

export class Interaction {
  readonly id: InteractionId;
  readonly organizationId: OrganizationId;
  readonly entityId: string;
  readonly entityType: "lead" | "customer" | "supplier" | "partner";
  readonly type: InteractionType;
  readonly direction: InteractionDirection;
  readonly subject: string;
  readonly summary: string;
  readonly occurredAt: string;
  readonly createdBy: string;

  private constructor(props: InteractionProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.entityId = props.entityId;
    this.entityType = props.entityType;
    this.type = props.type;
    this.direction = props.direction;
    this.subject = props.subject;
    this.summary = props.summary;
    this.occurredAt = props.occurredAt;
    this.createdBy = props.createdBy;
  }

  static create(
    props: Omit<InteractionProps, "id" | "occurredAt"> & {
      id?: InteractionId;
      occurredAt?: string;
    },
  ): Interaction {
    return new Interaction({
      id: props.id ?? `interaction-${Date.now()}`,
      organizationId: props.organizationId,
      entityId: props.entityId,
      entityType: props.entityType,
      type: props.type,
      direction: props.direction,
      subject: props.subject.trim(),
      summary: props.summary.trim(),
      occurredAt: props.occurredAt ?? new Date().toISOString(),
      createdBy: props.createdBy,
    });
  }

  toJSON(): InteractionProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      entityId: this.entityId,
      entityType: this.entityType,
      type: this.type,
      direction: this.direction,
      subject: this.subject,
      summary: this.summary,
      occurredAt: this.occurredAt,
      createdBy: this.createdBy,
    };
  }
}
