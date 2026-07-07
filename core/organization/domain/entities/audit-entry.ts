import type { AuditEntryId, OrganizationId, OrganizationMemberId } from "../../shared";

export type AuditResult = "success" | "failure" | "denied" | "pending";

export type AuditEntryProps = {
  id: AuditEntryId;
  organizationId: OrganizationId;
  actorId: OrganizationMemberId;
  actorName: string;
  module: string;
  action: string;
  description: string;
  result: AuditResult;
  metadata: Record<string, string>;
  occurredAt: string;
};

export class AuditEntry {
  readonly id: AuditEntryId;
  readonly organizationId: OrganizationId;
  readonly actorId: OrganizationMemberId;
  readonly actorName: string;
  readonly module: string;
  readonly action: string;
  readonly description: string;
  readonly result: AuditResult;
  readonly metadata: Record<string, string>;
  readonly occurredAt: string;

  private constructor(props: AuditEntryProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.actorId = props.actorId;
    this.actorName = props.actorName;
    this.module = props.module;
    this.action = props.action;
    this.description = props.description;
    this.result = props.result;
    this.metadata = { ...props.metadata };
    this.occurredAt = props.occurredAt;
  }

  static create(
    props: Omit<AuditEntryProps, "id" | "occurredAt"> & {
      id?: AuditEntryId;
      occurredAt?: string;
    },
  ): AuditEntry {
    return new AuditEntry({
      id: props.id ?? `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      actorId: props.actorId,
      actorName: props.actorName.trim(),
      module: props.module.trim(),
      action: props.action.trim(),
      description: props.description.trim(),
      result: props.result,
      metadata: props.metadata,
      occurredAt: props.occurredAt ?? new Date().toISOString(),
    });
  }

  toJSON(): AuditEntryProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      actorId: this.actorId,
      actorName: this.actorName,
      module: this.module,
      action: this.action,
      description: this.description,
      result: this.result,
      metadata: { ...this.metadata },
      occurredAt: this.occurredAt,
    };
  }
}
