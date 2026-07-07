import type { OrganizationId, PurchaseRequestId, SupplierQuoteId } from "../../shared";

export type SupplierQuoteStatus = "received" | "accepted" | "rejected" | "expired";

export type SupplierQuoteProps = {
  id: SupplierQuoteId;
  organizationId: OrganizationId;
  purchaseRequestId: PurchaseRequestId;
  supplierId: string;
  supplierName: string;
  amount: number;
  currency: string;
  deliveryDays: number;
  validUntil?: string;
  status: SupplierQuoteStatus;
  createdAt: string;
};

export class SupplierQuote {
  readonly id: SupplierQuoteId;
  readonly organizationId: OrganizationId;
  readonly purchaseRequestId: PurchaseRequestId;
  readonly supplierId: string;
  readonly supplierName: string;
  readonly amount: number;
  readonly currency: string;
  readonly deliveryDays: number;
  readonly validUntil?: string;
  readonly status: SupplierQuoteStatus;
  readonly createdAt: string;

  private constructor(props: SupplierQuoteProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.purchaseRequestId = props.purchaseRequestId;
    this.supplierId = props.supplierId;
    this.supplierName = props.supplierName;
    this.amount = props.amount;
    this.currency = props.currency;
    this.deliveryDays = props.deliveryDays;
    this.validUntil = props.validUntil;
    this.status = props.status;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<SupplierQuoteProps, "id" | "createdAt" | "status"> & {
      id?: SupplierQuoteId;
      createdAt?: string;
      status?: SupplierQuoteStatus;
    },
  ): SupplierQuote {
    return new SupplierQuote({
      id: props.id ?? `quote-${Date.now()}`,
      organizationId: props.organizationId,
      purchaseRequestId: props.purchaseRequestId,
      supplierId: props.supplierId,
      supplierName: props.supplierName.trim(),
      amount: props.amount,
      currency: props.currency,
      deliveryDays: props.deliveryDays,
      validUntil: props.validUntil,
      status: props.status ?? "received",
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  toJSON(): SupplierQuoteProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      purchaseRequestId: this.purchaseRequestId,
      supplierId: this.supplierId,
      supplierName: this.supplierName,
      amount: this.amount,
      currency: this.currency,
      deliveryDays: this.deliveryDays,
      validUntil: this.validUntil,
      status: this.status,
      createdAt: this.createdAt,
    };
  }
}
