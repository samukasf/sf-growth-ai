import type { OpportunityId, OrganizationId, ProposalId } from "../../shared";

export type ProposalStatus = "draft" | "sent" | "accepted" | "rejected" | "expired";

export type ProposalProps = {
  id: ProposalId;
  organizationId: OrganizationId;
  opportunityId: OpportunityId;
  title: string;
  content: string;
  value: number;
  currency: string;
  status: ProposalStatus;
  validUntil?: string;
  sentAt?: string;
  createdAt: string;
};

export class Proposal {
  readonly id: ProposalId;
  readonly organizationId: OrganizationId;
  readonly opportunityId: OpportunityId;
  readonly title: string;
  readonly content: string;
  readonly value: number;
  readonly currency: string;
  readonly status: ProposalStatus;
  readonly validUntil?: string;
  readonly sentAt?: string;
  readonly createdAt: string;

  private constructor(props: ProposalProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.opportunityId = props.opportunityId;
    this.title = props.title;
    this.content = props.content;
    this.value = props.value;
    this.currency = props.currency;
    this.status = props.status;
    this.validUntil = props.validUntil;
    this.sentAt = props.sentAt;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<ProposalProps, "id" | "createdAt" | "status"> & {
      id?: ProposalId;
      createdAt?: string;
      status?: ProposalStatus;
    },
  ): Proposal {
    return new Proposal({
      id: props.id ?? `proposal-${Date.now()}`,
      organizationId: props.organizationId,
      opportunityId: props.opportunityId,
      title: props.title.trim(),
      content: props.content.trim(),
      value: props.value,
      currency: props.currency,
      status: props.status ?? "draft",
      validUntil: props.validUntil,
      sentAt: props.sentAt,
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  markSent(): Proposal {
    return Proposal.create({
      ...this.toJSON(),
      status: "sent",
      sentAt: new Date().toISOString(),
    });
  }

  toJSON(): ProposalProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      opportunityId: this.opportunityId,
      title: this.title,
      content: this.content,
      value: this.value,
      currency: this.currency,
      status: this.status,
      validUntil: this.validUntil,
      sentAt: this.sentAt,
      createdAt: this.createdAt,
    };
  }
}
