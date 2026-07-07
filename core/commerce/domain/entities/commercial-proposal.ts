import type { CommercialProposalId, OrganizationId } from "../../shared";

export type CommercialProposalStatus = "draft" | "sent" | "accepted" | "rejected" | "expired";

export type CommercialProposalProps = {
  id: CommercialProposalId;
  organizationId: OrganizationId;
  customerId: string;
  title: string;
  content: string;
  totalValue: number;
  currency: string;
  validUntil?: string;
  status: CommercialProposalStatus;
  itemIds: string[];
  createdAt: string;
};

export class CommercialProposal {
  readonly id: CommercialProposalId;
  readonly organizationId: OrganizationId;
  readonly customerId: string;
  readonly title: string;
  readonly content: string;
  readonly totalValue: number;
  readonly currency: string;
  readonly validUntil?: string;
  readonly status: CommercialProposalStatus;
  readonly itemIds: string[];
  readonly createdAt: string;

  private constructor(props: CommercialProposalProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.customerId = props.customerId;
    this.title = props.title;
    this.content = props.content;
    this.totalValue = props.totalValue;
    this.currency = props.currency;
    this.validUntil = props.validUntil;
    this.status = props.status;
    this.itemIds = [...props.itemIds];
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<CommercialProposalProps, "id" | "createdAt" | "status"> & {
      id?: CommercialProposalId;
      createdAt?: string;
      status?: CommercialProposalStatus;
    },
  ): CommercialProposal {
    return new CommercialProposal({
      id: props.id ?? `proposal-${Date.now()}`,
      organizationId: props.organizationId,
      customerId: props.customerId,
      title: props.title.trim(),
      content: props.content.trim(),
      totalValue: props.totalValue,
      currency: props.currency,
      validUntil: props.validUntil,
      status: props.status ?? "draft",
      itemIds: props.itemIds,
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  toJSON(): CommercialProposalProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      customerId: this.customerId,
      title: this.title,
      content: this.content,
      totalValue: this.totalValue,
      currency: this.currency,
      validUntil: this.validUntil,
      status: this.status,
      itemIds: [...this.itemIds],
      createdAt: this.createdAt,
    };
  }
}
