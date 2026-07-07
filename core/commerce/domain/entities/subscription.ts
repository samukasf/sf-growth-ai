import type { OrganizationId, SubscriptionId } from "../../shared";

export type SubscriptionFrequency = "weekly" | "monthly" | "quarterly" | "yearly";
export type SubscriptionStatus = "active" | "paused" | "cancelled" | "expired";

export type SubscriptionProps = {
  id: SubscriptionId;
  organizationId: OrganizationId;
  customerId: string;
  planName: string;
  itemId: string;
  itemType: "product" | "service";
  amount: number;
  currency: string;
  frequency: SubscriptionFrequency;
  status: SubscriptionStatus;
  startDate: string;
  nextBillingDate?: string;
  createdAt: string;
};

export class Subscription {
  readonly id: SubscriptionId;
  readonly organizationId: OrganizationId;
  readonly customerId: string;
  readonly planName: string;
  readonly itemId: string;
  readonly itemType: "product" | "service";
  readonly amount: number;
  readonly currency: string;
  readonly frequency: SubscriptionFrequency;
  readonly status: SubscriptionStatus;
  readonly startDate: string;
  readonly nextBillingDate?: string;
  readonly createdAt: string;

  private constructor(props: SubscriptionProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.customerId = props.customerId;
    this.planName = props.planName;
    this.itemId = props.itemId;
    this.itemType = props.itemType;
    this.amount = props.amount;
    this.currency = props.currency;
    this.frequency = props.frequency;
    this.status = props.status;
    this.startDate = props.startDate;
    this.nextBillingDate = props.nextBillingDate;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<SubscriptionProps, "id" | "createdAt" | "status"> & {
      id?: SubscriptionId;
      createdAt?: string;
      status?: SubscriptionStatus;
    },
  ): Subscription {
    return new Subscription({
      id: props.id ?? `sub-${Date.now()}`,
      organizationId: props.organizationId,
      customerId: props.customerId,
      planName: props.planName.trim(),
      itemId: props.itemId,
      itemType: props.itemType,
      amount: props.amount,
      currency: props.currency,
      frequency: props.frequency,
      status: props.status ?? "active",
      startDate: props.startDate,
      nextBillingDate: props.nextBillingDate,
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  toJSON(): SubscriptionProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      customerId: this.customerId,
      planName: this.planName,
      itemId: this.itemId,
      itemType: this.itemType,
      amount: this.amount,
      currency: this.currency,
      frequency: this.frequency,
      status: this.status,
      startDate: this.startDate,
      nextBillingDate: this.nextBillingDate,
      createdAt: this.createdAt,
    };
  }
}
