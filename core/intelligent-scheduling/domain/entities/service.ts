import type { OrganizationId, ServiceId } from "../../shared";

export type ServiceProps = {
  id: ServiceId;
  organizationId: OrganizationId;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  currency: string;
  active: boolean;
  createdAt: string;
};

export class Service {
  readonly id: ServiceId;
  readonly organizationId: OrganizationId;
  readonly name: string;
  readonly description: string;
  readonly durationMinutes: number;
  readonly price: number;
  readonly currency: string;
  readonly active: boolean;
  readonly createdAt: string;

  private constructor(props: ServiceProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.name = props.name;
    this.description = props.description;
    this.durationMinutes = props.durationMinutes;
    this.price = props.price;
    this.currency = props.currency;
    this.active = props.active;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<ServiceProps, "id" | "createdAt" | "active"> & {
      id?: ServiceId;
      createdAt?: string;
      active?: boolean;
    },
  ): Service {
    return new Service({
      id: props.id ?? `service-${Date.now()}`,
      organizationId: props.organizationId,
      name: props.name.trim(),
      description: props.description.trim(),
      durationMinutes: props.durationMinutes,
      price: props.price,
      currency: props.currency,
      active: props.active ?? true,
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  toJSON(): ServiceProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      name: this.name,
      description: this.description,
      durationMinutes: this.durationMinutes,
      price: this.price,
      currency: this.currency,
      active: this.active,
      createdAt: this.createdAt,
    };
  }
}
