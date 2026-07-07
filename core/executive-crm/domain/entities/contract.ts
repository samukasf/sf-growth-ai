import type { ContractId, CustomerId, OrganizationId, ProposalId } from "../../shared";

export type ContractStatus = "draft" | "pending_signature" | "signed" | "expired" | "terminated";

export type ContractProps = {
  id: ContractId;
  organizationId: OrganizationId;
  customerId: CustomerId;
  proposalId?: ProposalId;
  title: string;
  value: number;
  currency: string;
  status: ContractStatus;
  startDate?: string;
  endDate?: string;
  signedAt?: string;
  createdAt: string;
};

export class Contract {
  readonly id: ContractId;
  readonly organizationId: OrganizationId;
  readonly customerId: CustomerId;
  readonly proposalId?: ProposalId;
  readonly title: string;
  readonly value: number;
  readonly currency: string;
  readonly status: ContractStatus;
  readonly startDate?: string;
  readonly endDate?: string;
  readonly signedAt?: string;
  readonly createdAt: string;

  private constructor(props: ContractProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.customerId = props.customerId;
    this.proposalId = props.proposalId;
    this.title = props.title;
    this.value = props.value;
    this.currency = props.currency;
    this.status = props.status;
    this.startDate = props.startDate;
    this.endDate = props.endDate;
    this.signedAt = props.signedAt;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<ContractProps, "id" | "createdAt" | "status"> & {
      id?: ContractId;
      createdAt?: string;
      status?: ContractStatus;
    },
  ): Contract {
    return new Contract({
      id: props.id ?? `contract-${Date.now()}`,
      organizationId: props.organizationId,
      customerId: props.customerId,
      proposalId: props.proposalId,
      title: props.title.trim(),
      value: props.value,
      currency: props.currency,
      status: props.status ?? "draft",
      startDate: props.startDate,
      endDate: props.endDate,
      signedAt: props.signedAt,
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  sign(): Contract {
    return Contract.create({
      ...this.toJSON(),
      status: "signed",
      signedAt: new Date().toISOString(),
    });
  }

  toJSON(): ContractProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      customerId: this.customerId,
      proposalId: this.proposalId,
      title: this.title,
      value: this.value,
      currency: this.currency,
      status: this.status,
      startDate: this.startDate,
      endDate: this.endDate,
      signedAt: this.signedAt,
      createdAt: this.createdAt,
    };
  }
}
