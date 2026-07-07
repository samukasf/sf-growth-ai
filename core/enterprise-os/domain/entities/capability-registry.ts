import type { CapabilityRegistryId, OrganizationId } from "../../shared";

export type CapabilityRegistryProps = {
  id: CapabilityRegistryId;
  organizationId: OrganizationId;
  capabilityIds: string[];
  updatedAt: string;
};

export class CapabilityRegistry {
  readonly id: CapabilityRegistryId;
  readonly organizationId: OrganizationId;
  readonly capabilityIds: string[];
  readonly updatedAt: string;

  private constructor(props: CapabilityRegistryProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.capabilityIds = [...props.capabilityIds];
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<CapabilityRegistryProps, "id" | "updatedAt"> & {
      id?: CapabilityRegistryId;
      updatedAt?: string;
    },
  ): CapabilityRegistry {
    return new CapabilityRegistry({
      id: props.id ?? `capability-registry-${Date.now()}`,
      organizationId: props.organizationId,
      capabilityIds: props.capabilityIds,
      updatedAt: props.updatedAt ?? new Date().toISOString(),
    });
  }

  register(capabilityId: string): CapabilityRegistry {
    if (this.capabilityIds.includes(capabilityId)) return this;
    return CapabilityRegistry.create({
      ...this.toJSON(),
      capabilityIds: [...this.capabilityIds, capabilityId],
      updatedAt: new Date().toISOString(),
    });
  }

  toJSON(): CapabilityRegistryProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      capabilityIds: [...this.capabilityIds],
      updatedAt: this.updatedAt,
    };
  }
}
