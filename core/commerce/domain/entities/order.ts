import type { OrderId, OrganizationId } from "../../shared";

export type OrderStatus =
  | "draft"
  | "pending"
  | "confirmed"
  | "processing"
  | "completed"
  | "cancelled";

export type OrderChannel = "online" | "in_store" | "phone" | "marketplace";

export type OrderProps = {
  id: OrderId;
  organizationId: OrganizationId;
  customerId: string;
  status: OrderStatus;
  channel: OrderChannel;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  itemIds: string[];
  createdAt: string;
  updatedAt: string;
};

export class Order {
  readonly id: OrderId;
  readonly organizationId: OrganizationId;
  readonly customerId: string;
  readonly status: OrderStatus;
  readonly channel: OrderChannel;
  readonly subtotal: number;
  readonly tax: number;
  readonly total: number;
  readonly currency: string;
  readonly itemIds: string[];
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(props: OrderProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.customerId = props.customerId;
    this.status = props.status;
    this.channel = props.channel;
    this.subtotal = props.subtotal;
    this.tax = props.tax;
    this.total = props.total;
    this.currency = props.currency;
    this.itemIds = [...props.itemIds];
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<OrderProps, "id" | "createdAt" | "updatedAt" | "status"> & {
      id?: OrderId;
      createdAt?: string;
      updatedAt?: string;
      status?: OrderStatus;
    },
  ): Order {
    const now = new Date().toISOString();
    return new Order({
      id: props.id ?? `order-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      customerId: props.customerId,
      status: props.status ?? "draft",
      channel: props.channel,
      subtotal: props.subtotal,
      tax: props.tax,
      total: props.total,
      currency: props.currency,
      itemIds: props.itemIds,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  complete(): Order {
    return Order.create({
      ...this.toJSON(),
      status: "completed",
      updatedAt: new Date().toISOString(),
    });
  }

  toJSON(): OrderProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      customerId: this.customerId,
      status: this.status,
      channel: this.channel,
      subtotal: this.subtotal,
      tax: this.tax,
      total: this.total,
      currency: this.currency,
      itemIds: [...this.itemIds],
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
