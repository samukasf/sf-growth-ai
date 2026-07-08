import type {
  AgencyId,
  ClientContractId,
  ClientContractStatus,
  ClientProposalId,
  CompanyId,
  OrganizationId,
} from "../../shared";

export type ClientContractProps = {
  id: ClientContractId;
  organizationId: OrganizationId;
  agencyId: AgencyId;
  companyId: CompanyId;
  proposalId: ClientProposalId;
  title: string;
  amount: number;
  currency: string;
  status: ClientContractStatus;
  startsAt: string;
  endsAt: string;
  signedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export class ClientContract {
  readonly id: ClientContractId;
  readonly organizationId: OrganizationId;
  readonly agencyId: AgencyId;
  readonly companyId: CompanyId;
  readonly proposalId: ClientProposalId;
  readonly title: string;
  readonly amount: number;
  readonly currency: string;
  readonly status: ClientContractStatus;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly signedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(props: ClientContractProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.agencyId = props.agencyId;
    this.companyId = props.companyId;
    this.proposalId = props.proposalId;
    this.title = props.title;
    this.amount = props.amount;
    this.currency = props.currency;
    this.status = props.status;
    this.startsAt = props.startsAt;
    this.endsAt = props.endsAt;
    this.signedAt = props.signedAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<ClientContractProps, "id" | "createdAt" | "updatedAt" | "status" | "currency"> & {
      id?: ClientContractId;
      status?: ClientContractStatus;
      currency?: string;
      signedAt?: string;
      createdAt?: string;
      updatedAt?: string;
    },
  ): ClientContract {
    if (!props.title.trim()) throw new Error("title is required");
    const now = new Date().toISOString();
    return new ClientContract({
      id: props.id ?? `cctr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      agencyId: props.agencyId,
      companyId: props.companyId,
      proposalId: props.proposalId,
      title: props.title.trim(),
      amount: props.amount,
      currency: props.currency ?? "EUR",
      status: props.status ?? "draft",
      startsAt: props.startsAt,
      endsAt: props.endsAt,
      signedAt: props.signedAt,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  withStatus(status: ClientContractStatus, signedAt?: string): ClientContract {
    return ClientContract.create({
      ...this.toJSON(),
      status,
      signedAt: signedAt ?? this.signedAt,
      updatedAt: new Date().toISOString(),
    });
  }

  toJSON(): ClientContractProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      agencyId: this.agencyId,
      companyId: this.companyId,
      proposalId: this.proposalId,
      title: this.title,
      amount: this.amount,
      currency: this.currency,
      status: this.status,
      startsAt: this.startsAt,
      endsAt: this.endsAt,
      signedAt: this.signedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
