import type { DeliveryId, OrderId, OrganizationId } from "../../shared";

export type DeliveryProvider = "internal" | "glovo" | "uber_eats" | "bolt_food";
export type DeliveryStatus = "pending" | "dispatched" | "in_transit" | "delivered" | "failed";

export type DeliveryProps = {
  id: DeliveryId;
  organizationId: OrganizationId;
  orderId: OrderId;
  provider: DeliveryProvider;
  status: DeliveryStatus;
  address: string;
  trackingCode?: string;
  estimatedAt?: string;
  deliveredAt?: string;
  createdAt: string;
};

export class Delivery {
  readonly id: DeliveryId;
  readonly organizationId: OrganizationId;
  readonly orderId: OrderId;
  readonly provider: DeliveryProvider;
  readonly status: DeliveryStatus;
  readonly address: string;
  readonly trackingCode?: string;
  readonly estimatedAt?: string;
  readonly deliveredAt?: string;
  readonly createdAt: string;

  private constructor(props: DeliveryProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.orderId = props.orderId;
    this.provider = props.provider;
    this.status = props.status;
    this.address = props.address;
    this.trackingCode = props.trackingCode;
    this.estimatedAt = props.estimatedAt;
    this.deliveredAt = props.deliveredAt;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<DeliveryProps, "id" | "createdAt" | "status"> & {
      id?: DeliveryId;
      createdAt?: string;
      status?: DeliveryStatus;
    },
  ): Delivery {
    return new Delivery({
      id: props.id ?? `delivery-${Date.now()}`,
      organizationId: props.organizationId,
      orderId: props.orderId,
      provider: props.provider,
      status: props.status ?? "pending",
      address: props.address.trim(),
      trackingCode: props.trackingCode,
      estimatedAt: props.estimatedAt,
      deliveredAt: props.deliveredAt,
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  toJSON(): DeliveryProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      orderId: this.orderId,
      provider: this.provider,
      status: this.status,
      address: this.address,
      trackingCode: this.trackingCode,
      estimatedAt: this.estimatedAt,
      deliveredAt: this.deliveredAt,
      createdAt: this.createdAt,
    };
  }
}
