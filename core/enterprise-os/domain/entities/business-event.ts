import type { BusinessEventId, OrganizationId } from "../../shared";

export type BusinessEventType =
  | "platform"
  | "capability"
  | "workflow"
  | "state"
  | "health"
  | "integration";

export type BusinessEventProps = {
  id: BusinessEventId;
  organizationId: OrganizationId;
  type: BusinessEventType;
  source: string;
  name: string;
  payload: Record<string, string>;
  occurredAt: string;
};

export class BusinessEvent {
  readonly id: BusinessEventId;
  readonly organizationId: OrganizationId;
  readonly type: BusinessEventType;
  readonly source: string;
  readonly name: string;
  readonly payload: Record<string, string>;
  readonly occurredAt: string;

  private constructor(props: BusinessEventProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.type = props.type;
    this.source = props.source;
    this.name = props.name;
    this.payload = { ...props.payload };
    this.occurredAt = props.occurredAt;
  }

  static create(
    props: Omit<BusinessEventProps, "id" | "occurredAt"> & {
      id?: BusinessEventId;
      occurredAt?: string;
    },
  ): BusinessEvent {
    return new BusinessEvent({
      id: props.id ?? `bevent-${Date.now()}`,
      organizationId: props.organizationId,
      type: props.type,
      source: props.source,
      name: props.name.trim(),
      payload: props.payload,
      occurredAt: props.occurredAt ?? new Date().toISOString(),
    });
  }

  toJSON(): BusinessEventProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      type: this.type,
      source: this.source,
      name: this.name,
      payload: { ...this.payload },
      occurredAt: this.occurredAt,
    };
  }
}
