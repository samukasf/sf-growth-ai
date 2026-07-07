import type { InvoiceId, OrderId, OrganizationId, PaymentId } from "../../shared";

export type InvoiceStatus = "draft" | "issued" | "paid" | "cancelled";

export type InvoiceProps = {
  id: InvoiceId;
  organizationId: OrganizationId;
  orderId: OrderId;
  paymentId?: PaymentId;
  number: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  issuedAt?: string;
  dueAt?: string;
  createdAt: string;
};

export class Invoice {
  readonly id: InvoiceId;
  readonly organizationId: OrganizationId;
  readonly orderId: OrderId;
  readonly paymentId?: PaymentId;
  readonly number: string;
  readonly amount: number;
  readonly currency: string;
  readonly status: InvoiceStatus;
  readonly issuedAt?: string;
  readonly dueAt?: string;
  readonly createdAt: string;

  private constructor(props: InvoiceProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.orderId = props.orderId;
    this.paymentId = props.paymentId;
    this.number = props.number;
    this.amount = props.amount;
    this.currency = props.currency;
    this.status = props.status;
    this.issuedAt = props.issuedAt;
    this.dueAt = props.dueAt;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<InvoiceProps, "id" | "createdAt" | "status"> & {
      id?: InvoiceId;
      createdAt?: string;
      status?: InvoiceStatus;
    },
  ): Invoice {
    return new Invoice({
      id: props.id ?? `inv-${Date.now()}`,
      organizationId: props.organizationId,
      orderId: props.orderId,
      paymentId: props.paymentId,
      number: props.number,
      amount: props.amount,
      currency: props.currency,
      status: props.status ?? "draft",
      issuedAt: props.issuedAt,
      dueAt: props.dueAt,
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  issue(): Invoice {
    return Invoice.create({
      ...this.toJSON(),
      status: "issued",
      issuedAt: new Date().toISOString(),
    });
  }

  toJSON(): InvoiceProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      orderId: this.orderId,
      paymentId: this.paymentId,
      number: this.number,
      amount: this.amount,
      currency: this.currency,
      status: this.status,
      issuedAt: this.issuedAt,
      dueAt: this.dueAt,
      createdAt: this.createdAt,
    };
  }
}
