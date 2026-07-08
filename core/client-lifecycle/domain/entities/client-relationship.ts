import type {
  AgencyId,
  ClientRelationshipId,
  ClientRelationshipStatus,
  CompanyId,
  OrganizationId,
} from "../../shared";

export type ClientRelationshipProps = {
  id: ClientRelationshipId;
  organizationId: OrganizationId;
  agencyId: AgencyId;
  companyId: CompanyId;
  status: ClientRelationshipStatus;
  npsScore?: number;
  lastContactAt?: string;
  accountManagerId?: string;
  notes: string[];
  createdAt: string;
  updatedAt: string;
};

export class ClientRelationship {
  readonly id: ClientRelationshipId;
  readonly organizationId: OrganizationId;
  readonly agencyId: AgencyId;
  readonly companyId: CompanyId;
  readonly status: ClientRelationshipStatus;
  readonly npsScore?: number;
  readonly lastContactAt?: string;
  readonly accountManagerId?: string;
  readonly notes: string[];
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(props: ClientRelationshipProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.agencyId = props.agencyId;
    this.companyId = props.companyId;
    this.status = props.status;
    this.npsScore = props.npsScore;
    this.lastContactAt = props.lastContactAt;
    this.accountManagerId = props.accountManagerId;
    this.notes = [...props.notes];
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<ClientRelationshipProps, "id" | "createdAt" | "updatedAt" | "status" | "notes"> & {
      id?: ClientRelationshipId;
      status?: ClientRelationshipStatus;
      notes?: string[];
      createdAt?: string;
      updatedAt?: string;
    },
  ): ClientRelationship {
    const now = new Date().toISOString();
    return new ClientRelationship({
      id: props.id ?? `crel-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      agencyId: props.agencyId,
      companyId: props.companyId,
      status: props.status ?? "healthy",
      npsScore: props.npsScore,
      lastContactAt: props.lastContactAt ?? now,
      accountManagerId: props.accountManagerId,
      notes: props.notes ?? [],
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  withStatus(status: ClientRelationshipStatus): ClientRelationship {
    return ClientRelationship.create({
      ...this.toJSON(),
      status,
      updatedAt: new Date().toISOString(),
    });
  }

  addNote(note: string): ClientRelationship {
    return ClientRelationship.create({
      ...this.toJSON(),
      notes: [...this.notes, note],
      lastContactAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  toJSON(): ClientRelationshipProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      agencyId: this.agencyId,
      companyId: this.companyId,
      status: this.status,
      npsScore: this.npsScore,
      lastContactAt: this.lastContactAt,
      accountManagerId: this.accountManagerId,
      notes: [...this.notes],
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
