import type {
  AgencyId,
  ClientLeadId,
  ClientOpportunityId,
  ClientOpportunityStatus,
  CompanyId,
  OrganizationId,
} from "../../shared";

export type ClientOpportunityProps = {
  id: ClientOpportunityId;
  organizationId: OrganizationId;
  agencyId: AgencyId;
  companyId: CompanyId;
  leadId: ClientLeadId;
  title: string;
  estimatedValue: number;
  status: ClientOpportunityStatus;
  probability: number;
  createdAt: string;
  updatedAt: string;
};

export class ClientOpportunity {
  readonly id: ClientOpportunityId;
  readonly organizationId: OrganizationId;
  readonly agencyId: AgencyId;
  readonly companyId: CompanyId;
  readonly leadId: ClientLeadId;
  readonly title: string;
  readonly estimatedValue: number;
  readonly status: ClientOpportunityStatus;
  readonly probability: number;
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(props: ClientOpportunityProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.agencyId = props.agencyId;
    this.companyId = props.companyId;
    this.leadId = props.leadId;
    this.title = props.title;
    this.estimatedValue = props.estimatedValue;
    this.status = props.status;
    this.probability = props.probability;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<ClientOpportunityProps, "id" | "createdAt" | "updatedAt" | "status" | "probability"> & {
      id?: ClientOpportunityId;
      status?: ClientOpportunityStatus;
      probability?: number;
      createdAt?: string;
      updatedAt?: string;
    },
  ): ClientOpportunity {
    if (!props.title.trim()) throw new Error("title is required");
    const now = new Date().toISOString();
    return new ClientOpportunity({
      id: props.id ?? `copp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      agencyId: props.agencyId,
      companyId: props.companyId,
      leadId: props.leadId,
      title: props.title.trim(),
      estimatedValue: props.estimatedValue,
      status: props.status ?? "open",
      probability: props.probability ?? 50,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  withStatus(status: ClientOpportunityStatus): ClientOpportunity {
    return ClientOpportunity.create({
      ...this.toJSON(),
      status,
      updatedAt: new Date().toISOString(),
    });
  }

  toJSON(): ClientOpportunityProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      agencyId: this.agencyId,
      companyId: this.companyId,
      leadId: this.leadId,
      title: this.title,
      estimatedValue: this.estimatedValue,
      status: this.status,
      probability: this.probability,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
