import type { OfferId, OrganizationId } from "../../shared";

export type OfferType = "product" | "service" | "bundle";
export type OfferStatus = "active" | "expired" | "draft";

export type OfferProps = {
  id: OfferId;
  organizationId: OrganizationId;
  name: string;
  description: string;
  type: OfferType;
  itemId: string;
  originalPrice: number;
  discountedPrice: number;
  currency: string;
  validUntil?: string;
  status: OfferStatus;
  createdAt: string;
};

export class Offer {
  readonly id: OfferId;
  readonly organizationId: OrganizationId;
  readonly name: string;
  readonly description: string;
  readonly type: OfferType;
  readonly itemId: string;
  readonly originalPrice: number;
  readonly discountedPrice: number;
  readonly currency: string;
  readonly validUntil?: string;
  readonly status: OfferStatus;
  readonly createdAt: string;

  private constructor(props: OfferProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.name = props.name;
    this.description = props.description;
    this.type = props.type;
    this.itemId = props.itemId;
    this.originalPrice = props.originalPrice;
    this.discountedPrice = props.discountedPrice;
    this.currency = props.currency;
    this.validUntil = props.validUntil;
    this.status = props.status;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<OfferProps, "id" | "createdAt" | "status"> & {
      id?: OfferId;
      createdAt?: string;
      status?: OfferStatus;
    },
  ): Offer {
    return new Offer({
      id: props.id ?? `offer-${Date.now()}`,
      organizationId: props.organizationId,
      name: props.name.trim(),
      description: props.description.trim(),
      type: props.type,
      itemId: props.itemId,
      originalPrice: props.originalPrice,
      discountedPrice: props.discountedPrice,
      currency: props.currency,
      validUntil: props.validUntil,
      status: props.status ?? "draft",
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  toJSON(): OfferProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      name: this.name,
      description: this.description,
      type: this.type,
      itemId: this.itemId,
      originalPrice: this.originalPrice,
      discountedPrice: this.discountedPrice,
      currency: this.currency,
      validUntil: this.validUntil,
      status: this.status,
      createdAt: this.createdAt,
    };
  }
}
