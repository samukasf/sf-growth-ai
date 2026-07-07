import type { OrganizationId, ResourceId } from "../../shared";

export type ResourceType = "room" | "equipment" | "vehicle" | "workspace" | "other";
export type ResourceStatus = "available" | "occupied" | "maintenance" | "inactive";

export type ResourceProps = {
  id: ResourceId;
  organizationId: OrganizationId;
  name: string;
  type: ResourceType;
  capacity: number;
  location: string;
  status: ResourceStatus;
  createdAt: string;
};

export class Resource {
  readonly id: ResourceId;
  readonly organizationId: OrganizationId;
  readonly name: string;
  readonly type: ResourceType;
  readonly capacity: number;
  readonly location: string;
  readonly status: ResourceStatus;
  readonly createdAt: string;

  private constructor(props: ResourceProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.name = props.name;
    this.type = props.type;
    this.capacity = props.capacity;
    this.location = props.location;
    this.status = props.status;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<ResourceProps, "id" | "createdAt" | "status"> & {
      id?: ResourceId;
      createdAt?: string;
      status?: ResourceStatus;
    },
  ): Resource {
    return new Resource({
      id: props.id ?? `resource-${Date.now()}`,
      organizationId: props.organizationId,
      name: props.name.trim(),
      type: props.type,
      capacity: props.capacity,
      location: props.location.trim(),
      status: props.status ?? "available",
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  toJSON(): ResourceProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      name: this.name,
      type: this.type,
      capacity: this.capacity,
      location: this.location,
      status: this.status,
      createdAt: this.createdAt,
    };
  }
}
