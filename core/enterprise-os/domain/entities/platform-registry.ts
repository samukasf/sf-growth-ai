import type { OrganizationId, PlatformRegistryId } from "../../shared";

export type PlatformRegistryProps = {
  id: PlatformRegistryId;
  organizationId: OrganizationId;
  platformIds: string[];
  defaultPlatformId?: string;
  updatedAt: string;
};

export class PlatformRegistry {
  readonly id: PlatformRegistryId;
  readonly organizationId: OrganizationId;
  readonly platformIds: string[];
  readonly defaultPlatformId?: string;
  readonly updatedAt: string;

  private constructor(props: PlatformRegistryProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.platformIds = [...props.platformIds];
    this.defaultPlatformId = props.defaultPlatformId;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<PlatformRegistryProps, "id" | "updatedAt"> & {
      id?: PlatformRegistryId;
      updatedAt?: string;
    },
  ): PlatformRegistry {
    return new PlatformRegistry({
      id: props.id ?? `platform-registry-${Date.now()}`,
      organizationId: props.organizationId,
      platformIds: props.platformIds,
      defaultPlatformId: props.defaultPlatformId,
      updatedAt: props.updatedAt ?? new Date().toISOString(),
    });
  }

  register(platformId: string): PlatformRegistry {
    if (this.platformIds.includes(platformId)) return this;
    return PlatformRegistry.create({
      ...this.toJSON(),
      platformIds: [...this.platformIds, platformId],
      updatedAt: new Date().toISOString(),
    });
  }

  toJSON(): PlatformRegistryProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      platformIds: [...this.platformIds],
      defaultPlatformId: this.defaultPlatformId,
      updatedAt: this.updatedAt,
    };
  }
}
