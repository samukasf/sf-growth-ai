import type { BusinessServiceId, OrganizationId } from "../../shared";

export type BusinessServiceStatus = "available" | "unavailable" | "deprecated";

export type BusinessServiceProps = {
  id: BusinessServiceId;
  organizationId: OrganizationId;
  name: string;
  slug: string;
  description: string;
  platformId: string;
  capabilityId: string;
  endpoint: string;
  status: BusinessServiceStatus;
  createdAt: string;
};

export class BusinessService {
  readonly id: BusinessServiceId;
  readonly organizationId: OrganizationId;
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly platformId: string;
  readonly capabilityId: string;
  readonly endpoint: string;
  readonly status: BusinessServiceStatus;
  readonly createdAt: string;

  private constructor(props: BusinessServiceProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.name = props.name;
    this.slug = props.slug;
    this.description = props.description;
    this.platformId = props.platformId;
    this.capabilityId = props.capabilityId;
    this.endpoint = props.endpoint;
    this.status = props.status;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<BusinessServiceProps, "id" | "createdAt" | "status"> & {
      id?: BusinessServiceId;
      createdAt?: string;
      status?: BusinessServiceStatus;
    },
  ): BusinessService {
    return new BusinessService({
      id: props.id ?? `bservice-${Date.now()}`,
      organizationId: props.organizationId,
      name: props.name.trim(),
      slug: props.slug.trim(),
      description: props.description.trim(),
      platformId: props.platformId,
      capabilityId: props.capabilityId,
      endpoint: props.endpoint,
      status: props.status ?? "available",
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  toJSON(): BusinessServiceProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      name: this.name,
      slug: this.slug,
      description: this.description,
      platformId: this.platformId,
      capabilityId: this.capabilityId,
      endpoint: this.endpoint,
      status: this.status,
      createdAt: this.createdAt,
    };
  }
}
