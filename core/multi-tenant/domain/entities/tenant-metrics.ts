import type { AgencyId, OrganizationId, TenantId, TenantMetricsSnapshotId } from "../../shared";

export type TenantMetricsProps = {
  id: TenantMetricsSnapshotId;
  organizationId: OrganizationId;
  agencyId: AgencyId;
  tenantId: TenantId;
  usage: {
    users: number;
    projects: number;
    storageGb: number;
    apiCallsToday: number;
  };
  computedAt: string;
};

export class TenantMetrics {
  readonly id: TenantMetricsSnapshotId;
  readonly organizationId: OrganizationId;
  readonly agencyId: AgencyId;
  readonly tenantId: TenantId;
  readonly usage: TenantMetricsProps["usage"];
  readonly computedAt: string;

  private constructor(props: TenantMetricsProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.agencyId = props.agencyId;
    this.tenantId = props.tenantId;
    this.usage = { ...props.usage };
    this.computedAt = props.computedAt;
  }

  static create(
    props: Omit<TenantMetricsProps, "id" | "computedAt"> & {
      id?: TenantMetricsSnapshotId;
      computedAt?: string;
    },
  ): TenantMetrics {
    return new TenantMetrics({
      id: props.id ?? `tmetrics-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      agencyId: props.agencyId,
      tenantId: props.tenantId,
      usage: props.usage,
      computedAt: props.computedAt ?? new Date().toISOString(),
    });
  }

  toJSON(): TenantMetricsProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      agencyId: this.agencyId,
      tenantId: this.tenantId,
      usage: { ...this.usage },
      computedAt: this.computedAt,
    };
  }
}
