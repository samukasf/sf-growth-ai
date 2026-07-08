import type {
  AgencyId,
  ClientContractId,
  ClientRenewalId,
  ClientRenewalStatus,
  CompanyId,
  OrganizationId,
} from "../../shared";

export type ClientRenewalProps = {
  id: ClientRenewalId;
  organizationId: OrganizationId;
  agencyId: AgencyId;
  companyId: CompanyId;
  contractId: ClientContractId;
  proposedAmount: number;
  currency: string;
  status: ClientRenewalStatus;
  suggestedAt: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
};

export class ClientRenewal {
  readonly id: ClientRenewalId;
  readonly organizationId: OrganizationId;
  readonly agencyId: AgencyId;
  readonly companyId: CompanyId;
  readonly contractId: ClientContractId;
  readonly proposedAmount: number;
  readonly currency: string;
  readonly status: ClientRenewalStatus;
  readonly suggestedAt: string;
  readonly expiresAt: string;
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(props: ClientRenewalProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.agencyId = props.agencyId;
    this.companyId = props.companyId;
    this.contractId = props.contractId;
    this.proposedAmount = props.proposedAmount;
    this.currency = props.currency;
    this.status = props.status;
    this.suggestedAt = props.suggestedAt;
    this.expiresAt = props.expiresAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<
      ClientRenewalProps,
      "id" | "createdAt" | "updatedAt" | "status" | "currency" | "suggestedAt"
    > & {
      id?: ClientRenewalId;
      status?: ClientRenewalStatus;
      currency?: string;
      suggestedAt?: string;
      createdAt?: string;
      updatedAt?: string;
    },
  ): ClientRenewal {
    const now = new Date().toISOString();
    return new ClientRenewal({
      id: props.id ?? `cren-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      agencyId: props.agencyId,
      companyId: props.companyId,
      contractId: props.contractId,
      proposedAmount: props.proposedAmount,
      currency: props.currency ?? "EUR",
      status: props.status ?? "pending",
      suggestedAt: props.suggestedAt ?? now,
      expiresAt: props.expiresAt,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  withStatus(status: ClientRenewalStatus): ClientRenewal {
    return ClientRenewal.create({
      ...this.toJSON(),
      status,
      updatedAt: new Date().toISOString(),
    });
  }

  toJSON(): ClientRenewalProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      agencyId: this.agencyId,
      companyId: this.companyId,
      contractId: this.contractId,
      proposedAmount: this.proposedAmount,
      currency: this.currency,
      status: this.status,
      suggestedAt: this.suggestedAt,
      expiresAt: this.expiresAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
