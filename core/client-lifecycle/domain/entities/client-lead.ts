import type {
  AgencyId,
  ClientLeadId,
  ClientLeadStatus,
  CompanyId,
  OrganizationId,
} from "../../shared";

export type ClientLeadProps = {
  id: ClientLeadId;
  organizationId: OrganizationId;
  agencyId: AgencyId;
  companyId?: CompanyId;
  name: string;
  email?: string;
  phone?: string;
  source: string;
  status: ClientLeadStatus;
  score: number;
  createdAt: string;
  updatedAt: string;
};

export class ClientLead {
  readonly id: ClientLeadId;
  readonly organizationId: OrganizationId;
  readonly agencyId: AgencyId;
  readonly companyId?: CompanyId;
  readonly name: string;
  readonly email?: string;
  readonly phone?: string;
  readonly source: string;
  readonly status: ClientLeadStatus;
  readonly score: number;
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(props: ClientLeadProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.agencyId = props.agencyId;
    this.companyId = props.companyId;
    this.name = props.name;
    this.email = props.email;
    this.phone = props.phone;
    this.source = props.source;
    this.status = props.status;
    this.score = props.score;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<ClientLeadProps, "id" | "createdAt" | "updatedAt" | "status" | "score"> & {
      id?: ClientLeadId;
      status?: ClientLeadStatus;
      score?: number;
      createdAt?: string;
      updatedAt?: string;
    },
  ): ClientLead {
    if (!props.name.trim()) throw new Error("name is required");
    if (!props.source.trim()) throw new Error("source is required");
    const now = new Date().toISOString();
    return new ClientLead({
      id: props.id ?? `clead-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      agencyId: props.agencyId,
      companyId: props.companyId,
      name: props.name.trim(),
      email: props.email,
      phone: props.phone,
      source: props.source.trim(),
      status: props.status ?? "new",
      score: props.score ?? 0,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  withStatus(status: ClientLeadStatus): ClientLead {
    return ClientLead.create({ ...this.toJSON(), status, updatedAt: new Date().toISOString() });
  }

  withScore(score: number): ClientLead {
    return ClientLead.create({ ...this.toJSON(), score, updatedAt: new Date().toISOString() });
  }

  toJSON(): ClientLeadProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      agencyId: this.agencyId,
      companyId: this.companyId,
      name: this.name,
      email: this.email,
      phone: this.phone,
      source: this.source,
      status: this.status,
      score: this.score,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
