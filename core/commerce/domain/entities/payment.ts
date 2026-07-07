import type { OrderId, OrganizationId, PaymentId } from "../../shared";

export type PaymentMethod =
  | "stripe"
  | "paypal"
  | "mbway"
  | "multibanco"
  | "bank_transfer"
  | "cash";

export type PaymentStatus = "pending" | "processing" | "completed" | "failed" | "refunded";

export type PaymentProps = {
  id: PaymentId;
  organizationId: OrganizationId;
  orderId: OrderId;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionRef?: string;
  paidAt?: string;
  createdAt: string;
};

export class Payment {
  readonly id: PaymentId;
  readonly organizationId: OrganizationId;
  readonly orderId: OrderId;
  readonly amount: number;
  readonly currency: string;
  readonly method: PaymentMethod;
  readonly status: PaymentStatus;
  readonly transactionRef?: string;
  readonly paidAt?: string;
  readonly createdAt: string;

  private constructor(props: PaymentProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.orderId = props.orderId;
    this.amount = props.amount;
    this.currency = props.currency;
    this.method = props.method;
    this.status = props.status;
    this.transactionRef = props.transactionRef;
    this.paidAt = props.paidAt;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<PaymentProps, "id" | "createdAt" | "status"> & {
      id?: PaymentId;
      createdAt?: string;
      status?: PaymentStatus;
    },
  ): Payment {
    return new Payment({
      id: props.id ?? `pay-${Date.now()}`,
      organizationId: props.organizationId,
      orderId: props.orderId,
      amount: props.amount,
      currency: props.currency,
      method: props.method,
      status: props.status ?? "pending",
      transactionRef: props.transactionRef,
      paidAt: props.paidAt,
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  receive(transactionRef: string): Payment {
    return Payment.create({
      ...this.toJSON(),
      status: "completed",
      transactionRef,
      paidAt: new Date().toISOString(),
    });
  }

  toJSON(): PaymentProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      orderId: this.orderId,
      amount: this.amount,
      currency: this.currency,
      method: this.method,
      status: this.status,
      transactionRef: this.transactionRef,
      paidAt: this.paidAt,
      createdAt: this.createdAt,
    };
  }
}
