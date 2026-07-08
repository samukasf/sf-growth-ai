import type {
  AgencyClientId,
  AgencyClientStatus,
  AgencyId,
  CompanyId,
  OrganizationId,
} from "../../shared";

export type ClientExecutiveStackProps = {
  companyBrainId: string;
  executiveMemoryId: string;
  executiveContextId: string;
  executiveCouncilId: string;
  executiveTimelineId: string;
  executiveDashboardId: string;
};

export type AgencyClientProps = {
  id: AgencyClientId;
  organizationId: OrganizationId;
  agencyId: AgencyId;
  companyId: CompanyId;
  name: string;
  industry?: string;
  status: AgencyClientStatus;
  executiveStack: ClientExecutiveStackProps;
  onboardedAt: string;
  createdAt: string;
  updatedAt: string;
};

export class AgencyClient {
  readonly id: AgencyClientId;
  readonly organizationId: OrganizationId;
  readonly agencyId: AgencyId;
  readonly companyId: CompanyId;
  readonly name: string;
  readonly industry?: string;
  readonly status: AgencyClientStatus;
  readonly executiveStack: ClientExecutiveStackProps;
  readonly onboardedAt: string;
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(props: AgencyClientProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.agencyId = props.agencyId;
    this.companyId = props.companyId;
    this.name = props.name;
    this.industry = props.industry;
    this.status = props.status;
    this.executiveStack = { ...props.executiveStack };
    this.onboardedAt = props.onboardedAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static createExecutiveStack(companyId: CompanyId): ClientExecutiveStackProps {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return {
      companyBrainId: `cbrain-${companyId}-${suffix}`,
      executiveMemoryId: `emem-${companyId}-${suffix}`,
      executiveContextId: `ectx-${companyId}-${suffix}`,
      executiveCouncilId: `ecouncil-${companyId}-${suffix}`,
      executiveTimelineId: `etimeline-${companyId}-${suffix}`,
      executiveDashboardId: `edash-${companyId}-${suffix}`,
    };
  }

  static create(
    props: Omit<
      AgencyClientProps,
      "id" | "createdAt" | "updatedAt" | "status" | "executiveStack" | "onboardedAt"
    > & {
      id?: AgencyClientId;
      status?: AgencyClientStatus;
      executiveStack?: ClientExecutiveStackProps;
      onboardedAt?: string;
      createdAt?: string;
      updatedAt?: string;
    },
  ): AgencyClient {
    if (!props.name.trim()) throw new Error("name is required");
    const now = new Date().toISOString();
    return new AgencyClient({
      id: props.id ?? `aclient-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      agencyId: props.agencyId,
      companyId: props.companyId,
      name: props.name.trim(),
      industry: props.industry,
      status: props.status ?? "active",
      executiveStack: props.executiveStack ?? AgencyClient.createExecutiveStack(props.companyId),
      onboardedAt: props.onboardedAt ?? now,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  withStatus(status: AgencyClientStatus): AgencyClient {
    return AgencyClient.create({
      ...this.toJSON(),
      status,
      updatedAt: new Date().toISOString(),
    });
  }

  toJSON(): AgencyClientProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      agencyId: this.agencyId,
      companyId: this.companyId,
      name: this.name,
      industry: this.industry,
      status: this.status,
      executiveStack: { ...this.executiveStack },
      onboardedAt: this.onboardedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
