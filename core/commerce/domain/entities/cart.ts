import type { CartId, OrganizationId } from "../../shared";

export type CartItem = {
  itemType: "product" | "service";
  itemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

export type CartProps = {
  id: CartId;
  organizationId: OrganizationId;
  customerId: string;
  items: CartItem[];
  currency: string;
  updatedAt: string;
};

export class Cart {
  readonly id: CartId;
  readonly organizationId: OrganizationId;
  readonly customerId: string;
  readonly items: CartItem[];
  readonly currency: string;
  readonly updatedAt: string;

  private constructor(props: CartProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.customerId = props.customerId;
    this.items = props.items.map((i) => ({ ...i }));
    this.currency = props.currency;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<CartProps, "id" | "updatedAt"> & { id?: CartId; updatedAt?: string },
  ): Cart {
    return new Cart({
      id: props.id ?? `cart-${Date.now()}`,
      organizationId: props.organizationId,
      customerId: props.customerId,
      items: props.items,
      currency: props.currency,
      updatedAt: props.updatedAt ?? new Date().toISOString(),
    });
  }

  subtotal(): number {
    return this.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  }

  toJSON(): CartProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      customerId: this.customerId,
      items: this.items.map((i) => ({ ...i })),
      currency: this.currency,
      updatedAt: this.updatedAt,
    };
  }
}
