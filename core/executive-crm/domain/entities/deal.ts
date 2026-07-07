import type { CustomerId, DealId, OpportunityId, OrganizationId } from "../../shared";

export type DealStatus = "pending" | "closed_won" | "closed_lost";

export type DealProps = {
  id: DealId;
  organizationId: OrganizationId;
  opportunityId: OpportunityId;
  customerId: CustomerId;
  title: string;
  value: number;
  currency: string;
  status: DealStatus;
  closedAt?: string;
  createdAt: string;
};

export class Deal {
  readonly id: DealId;
  readonly organizationId: OrganizationId;
  readonly opportunityId: OpportunityId;
  readonly customerId: CustomerId;
  readonly title: string;
  readonly value: number;
  readonly currency: string;
  readonly status: DealStatus;
  readonly closedAt?: string;
  readonly createdAt: string;

  private constructor(props: DealProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.opportunityId = props.opportunityId;
    this.customerId = props.customerId;
    this.title = props.title;
    this.value = props.value;
    this.currency = props.currency;
    this.status = props.status;
    this.closedAt = props.closedAt;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<DealProps, "id" | "createdAt" | "status"> & {
      id?: DealId;
      createdAt?: string;
      status?: DealStatus;
    },
  ): Deal {
    return new Deal({
      id: props.id ?? `deal-${Date.now()}`,
      organizationId: props.organizationId,
      opportunityId: props.opportunityId,
      customerId: props.customerId,
      title: props.title.trim(),
      value: props.value,
      currency: props.currency,
      status: props.status ?? "pending",
      closedAt: props.closedAt,
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  toJSON(): DealProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      opportunityId: this.opportunityId,
      customerId: this.customerId,
      title: this.title,
      value: this.value,
      currency: this.currency,
      status: this.status,
      closedAt: this.closedAt,
      createdAt: this.createdAt,
    };
  }
}
