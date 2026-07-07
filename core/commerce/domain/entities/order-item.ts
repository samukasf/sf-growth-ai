import type { OrderId, OrderItemId, OrganizationId } from "../../shared";

export type OrderItemType = "product" | "service";

export type OrderItemProps = {
  id: OrderItemId;
  organizationId: OrganizationId;
  orderId: OrderId;
  itemType: OrderItemType;
  itemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
};

export class OrderItem {
  readonly id: OrderItemId;
  readonly organizationId: OrganizationId;
  readonly orderId: OrderId;
  readonly itemType: OrderItemType;
  readonly itemId: string;
  readonly name: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly totalPrice: number;
  readonly currency: string;

  private constructor(props: OrderItemProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.orderId = props.orderId;
    this.itemType = props.itemType;
    this.itemId = props.itemId;
    this.name = props.name;
    this.quantity = props.quantity;
    this.unitPrice = props.unitPrice;
    this.totalPrice = props.totalPrice;
    this.currency = props.currency;
  }

  static create(
    props: Omit<OrderItemProps, "id" | "totalPrice"> & { id?: OrderItemId },
  ): OrderItem {
    return new OrderItem({
      id: props.id ?? `item-${Date.now()}`,
      organizationId: props.organizationId,
      orderId: props.orderId,
      itemType: props.itemType,
      itemId: props.itemId,
      name: props.name.trim(),
      quantity: props.quantity,
      unitPrice: props.unitPrice,
      totalPrice: props.quantity * props.unitPrice,
      currency: props.currency,
    });
  }

  toJSON(): OrderItemProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      orderId: this.orderId,
      itemType: this.itemType,
      itemId: this.itemId,
      name: this.name,
      quantity: this.quantity,
      unitPrice: this.unitPrice,
      totalPrice: this.totalPrice,
      currency: this.currency,
    };
  }
}
