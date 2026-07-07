import type { BusinessContextId, OrganizationId } from "../../shared";

export type BusinessContextProps = {
  id: BusinessContextId;
  organizationId: OrganizationId;
  name: string;
  actorId: string;
  actorType: "user" | "system" | "agent";
  platformId?: string;
  capabilityId?: string;
  metadata: Record<string, string>;
  createdAt: string;
};

export class BusinessContext {
  readonly id: BusinessContextId;
  readonly organizationId: OrganizationId;
  readonly name: string;
  readonly actorId: string;
  readonly actorType: "user" | "system" | "agent";
  readonly platformId?: string;
  readonly capabilityId?: string;
  readonly metadata: Record<string, string>;
  readonly createdAt: string;

  private constructor(props: BusinessContextProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.name = props.name;
    this.actorId = props.actorId;
    this.actorType = props.actorType;
    this.platformId = props.platformId;
    this.capabilityId = props.capabilityId;
    this.metadata = { ...props.metadata };
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<BusinessContextProps, "id" | "createdAt"> & {
      id?: BusinessContextId;
      createdAt?: string;
    },
  ): BusinessContext {
    return new BusinessContext({
      id: props.id ?? `context-${Date.now()}`,
      organizationId: props.organizationId,
      name: props.name.trim(),
      actorId: props.actorId,
      actorType: props.actorType,
      platformId: props.platformId,
      capabilityId: props.capabilityId,
      metadata: props.metadata,
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  toJSON(): BusinessContextProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      name: this.name,
      actorId: this.actorId,
      actorType: this.actorType,
      platformId: this.platformId,
      capabilityId: this.capabilityId,
      metadata: { ...this.metadata },
      createdAt: this.createdAt,
    };
  }
}
