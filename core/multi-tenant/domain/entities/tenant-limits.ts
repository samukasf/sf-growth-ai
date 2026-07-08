import type { AgencyId, OrganizationId, TenantId, TenantLimitsId } from "../../shared";

export type TenantLimitsProps = {
  id: TenantLimitsId;
  organizationId: OrganizationId;
  agencyId: AgencyId;
  tenantId: TenantId;
  maxUsers: number;
  maxProjects: number;
  maxStorageGb: number;
  maxApiCallsPerDay: number;
  updatedAt: string;
};

export class TenantLimits {
  readonly id: TenantLimitsId;
  readonly organizationId: OrganizationId;
  readonly agencyId: AgencyId;
  readonly tenantId: TenantId;
  readonly maxUsers: number;
  readonly maxProjects: number;
  readonly maxStorageGb: number;
  readonly maxApiCallsPerDay: number;
  readonly updatedAt: string;

  private constructor(props: TenantLimitsProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.agencyId = props.agencyId;
    this.tenantId = props.tenantId;
    this.maxUsers = props.maxUsers;
    this.maxProjects = props.maxProjects;
    this.maxStorageGb = props.maxStorageGb;
    this.maxApiCallsPerDay = props.maxApiCallsPerDay;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<TenantLimitsProps, "id" | "updatedAt"> & {
      id?: TenantLimitsId;
      updatedAt?: string;
    },
  ): TenantLimits {
    return new TenantLimits({
      id: props.id ?? `tlimits-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      agencyId: props.agencyId,
      tenantId: props.tenantId,
      maxUsers: props.maxUsers,
      maxProjects: props.maxProjects,
      maxStorageGb: props.maxStorageGb,
      maxApiCallsPerDay: props.maxApiCallsPerDay,
      updatedAt: props.updatedAt ?? new Date().toISOString(),
    });
  }

  toJSON(): TenantLimitsProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      agencyId: this.agencyId,
      tenantId: this.tenantId,
      maxUsers: this.maxUsers,
      maxProjects: this.maxProjects,
      maxStorageGb: this.maxStorageGb,
      maxApiCallsPerDay: this.maxApiCallsPerDay,
      updatedAt: this.updatedAt,
    };
  }
}
