import type {
  AgencyId,
  ClientOpportunityId,
  ClientProposalId,
  ClientProposalStatus,
  CompanyId,
  OrganizationId,
} from "../../shared";

export type ClientProposalProps = {
  id: ClientProposalId;
  organizationId: OrganizationId;
  agencyId: AgencyId;
  companyId: CompanyId;
  opportunityId: ClientOpportunityId;
  title: string;
  amount: number;
  currency: string;
  status: ClientProposalStatus;
  validUntil: string;
  createdAt: string;
  updatedAt: string;
};

export class ClientProposal {
  readonly id: ClientProposalId;
  readonly organizationId: OrganizationId;
  readonly agencyId: AgencyId;
  readonly companyId: CompanyId;
  readonly opportunityId: ClientOpportunityId;
  readonly title: string;
  readonly amount: number;
  readonly currency: string;
  readonly status: ClientProposalStatus;
  readonly validUntil: string;
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(props: ClientProposalProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.agencyId = props.agencyId;
    this.companyId = props.companyId;
    this.opportunityId = props.opportunityId;
    this.title = props.title;
    this.amount = props.amount;
    this.currency = props.currency;
    this.status = props.status;
    this.validUntil = props.validUntil;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<ClientProposalProps, "id" | "createdAt" | "updatedAt" | "status" | "currency"> & {
      id?: ClientProposalId;
      status?: ClientProposalStatus;
      currency?: string;
      createdAt?: string;
      updatedAt?: string;
    },
  ): ClientProposal {
    if (!props.title.trim()) throw new Error("title is required");
    const now = new Date().toISOString();
    return new ClientProposal({
      id: props.id ?? `cprop-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      agencyId: props.agencyId,
      companyId: props.companyId,
      opportunityId: props.opportunityId,
      title: props.title.trim(),
      amount: props.amount,
      currency: props.currency ?? "EUR",
      status: props.status ?? "draft",
      validUntil: props.validUntil,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  withStatus(status: ClientProposalStatus): ClientProposal {
    return ClientProposal.create({
      ...this.toJSON(),
      status,
      updatedAt: new Date().toISOString(),
    });
  }

  toJSON(): ClientProposalProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      agencyId: this.agencyId,
      companyId: this.companyId,
      opportunityId: this.opportunityId,
      title: this.title,
      amount: this.amount,
      currency: this.currency,
      status: this.status,
      validUntil: this.validUntil,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
