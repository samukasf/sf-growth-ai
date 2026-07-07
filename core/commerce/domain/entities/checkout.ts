import type { CartId, CheckoutId, OrganizationId } from "../../shared";

export type CheckoutStatus = "pending" | "completed" | "abandoned" | "expired";

export type CheckoutProps = {
  id: CheckoutId;
  organizationId: OrganizationId;
  cartId: CartId;
  customerId: string;
  status: CheckoutStatus;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  createdAt: string;
};

export class Checkout {
  readonly id: CheckoutId;
  readonly organizationId: OrganizationId;
  readonly cartId: CartId;
  readonly customerId: string;
  readonly status: CheckoutStatus;
  readonly subtotal: number;
  readonly tax: number;
  readonly total: number;
  readonly currency: string;
  readonly createdAt: string;

  private constructor(props: CheckoutProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.cartId = props.cartId;
    this.customerId = props.customerId;
    this.status = props.status;
    this.subtotal = props.subtotal;
    this.tax = props.tax;
    this.total = props.total;
    this.currency = props.currency;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<CheckoutProps, "id" | "createdAt" | "status"> & {
      id?: CheckoutId;
      createdAt?: string;
      status?: CheckoutStatus;
    },
  ): Checkout {
    return new Checkout({
      id: props.id ?? `checkout-${Date.now()}`,
      organizationId: props.organizationId,
      cartId: props.cartId,
      customerId: props.customerId,
      status: props.status ?? "pending",
      subtotal: props.subtotal,
      tax: props.tax,
      total: props.total,
      currency: props.currency,
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  toJSON(): CheckoutProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      cartId: this.cartId,
      customerId: this.customerId,
      status: this.status,
      subtotal: this.subtotal,
      tax: this.tax,
      total: this.total,
      currency: this.currency,
      createdAt: this.createdAt,
    };
  }
}
