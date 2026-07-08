import type { AgencyId, CompanyId, OrganizationId, TenantId, TenantStatus } from "../../shared";
import type { TenantExecutiveStackProps } from "./tenant-executive-stack";

export type TenantProps = {
  id: TenantId;
  organizationId: OrganizationId;
  agencyId: AgencyId;
  companyId: CompanyId;
  name: string;
  slug: string;
  status: TenantStatus;
  executiveStack: TenantExecutiveStackProps;
  createdAt: string;
  updatedAt: string;
};

export class Tenant {
  readonly id: TenantId;
  readonly organizationId: OrganizationId;
  readonly agencyId: AgencyId;
  readonly companyId: CompanyId;
  readonly name: string;
  readonly slug: string;
  readonly status: TenantStatus;
  readonly executiveStack: TenantExecutiveStackProps;
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(props: TenantProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.agencyId = props.agencyId;
    this.companyId = props.companyId;
    this.name = props.name;
    this.slug = props.slug;
    this.status = props.status;
    this.executiveStack = { ...props.executiveStack };
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<TenantProps, "id" | "createdAt" | "updatedAt" | "status" | "executiveStack"> & {
      id?: TenantId;
      status?: TenantStatus;
      executiveStack?: TenantExecutiveStackProps;
      createdAt?: string;
      updatedAt?: string;
    },
  ): Tenant {
    if (!props.name.trim()) throw new Error("name is required");
    const now = new Date().toISOString();
    return new Tenant({
      id: props.id ?? `tenant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      agencyId: props.agencyId,
      companyId: props.companyId,
      name: props.name.trim(),
      slug: props.slug.trim().toLowerCase(),
      status: props.status ?? "pending",
      executiveStack:
        props.executiveStack ??
        Tenant.createExecutiveStack(props.organizationId, props.agencyId, props.companyId),
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  static createExecutiveStack(
    organizationId: OrganizationId,
    agencyId: AgencyId,
    companyId: CompanyId,
  ): TenantExecutiveStackProps {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const scope = `${organizationId}-${agencyId}-${companyId}`;
    return {
      companyBrainId: `cbrain-${scope}-${suffix}`,
      executiveMemoryId: `emem-${scope}-${suffix}`,
      executiveCouncilId: `ecouncil-${scope}-${suffix}`,
      executiveTimelineId: `etimeline-${scope}-${suffix}`,
      executiveDashboardId: `edash-${scope}-${suffix}`,
      executiveMissionsId: `emissions-${scope}-${suffix}`,
      executiveOpportunitiesId: `eopp-${scope}-${suffix}`,
      executiveProjectsId: `eproj-${scope}-${suffix}`,
    };
  }

  withStatus(status: TenantStatus): Tenant {
    return Tenant.create({
      ...this.toJSON(),
      status,
      updatedAt: new Date().toISOString(),
    });
  }

  toJSON(): TenantProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      agencyId: this.agencyId,
      companyId: this.companyId,
      name: this.name,
      slug: this.slug,
      status: this.status,
      executiveStack: { ...this.executiveStack },
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
