import type { OrganizationId, ServiceId } from "../../shared";

export type ServiceStatus = "active" | "inactive";

export type ServiceProps = {
  id: ServiceId;
  organizationId: OrganizationId;
  name: string;
  description: string;
  price: number;
  currency: string;
  durationMinutes: number;
  category: string;
  status: ServiceStatus;
  createdAt: string;
};

export class Service {
  readonly id: ServiceId;
  readonly organizationId: OrganizationId;
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly currency: string;
  readonly durationMinutes: number;
  readonly category: string;
  readonly status: ServiceStatus;
  readonly createdAt: string;

  private constructor(props: ServiceProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.name = props.name;
    this.description = props.description;
    this.price = props.price;
    this.currency = props.currency;
    this.durationMinutes = props.durationMinutes;
    this.category = props.category;
    this.status = props.status;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<ServiceProps, "id" | "createdAt" | "status"> & {
      id?: ServiceId;
      createdAt?: string;
      status?: ServiceStatus;
    },
  ): Service {
    return new Service({
      id: props.id ?? `service-${Date.now()}`,
      organizationId: props.organizationId,
      name: props.name.trim(),
      description: props.description.trim(),
      price: props.price,
      currency: props.currency,
      durationMinutes: props.durationMinutes,
      category: props.category.trim(),
      status: props.status ?? "active",
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  toJSON(): ServiceProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      name: this.name,
      description: this.description,
      price: this.price,
      currency: this.currency,
      durationMinutes: this.durationMinutes,
      category: this.category,
      status: this.status,
      createdAt: this.createdAt,
    };
  }
}
