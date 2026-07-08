import type { AgencyId, AgencyMetricsSnapshotId, OrganizationId } from "../../shared";

export type AgencyMetricsProps = {
  id: AgencyMetricsSnapshotId;
  organizationId: OrganizationId;
  agencyId: AgencyId;
  totals: {
    clients: number;
    activeProjects: number;
    departments: number;
    employees: number;
    partners: number;
    pipelineValue: number;
  };
  computedAt: string;
};

export class AgencyMetrics {
  readonly id: AgencyMetricsSnapshotId;
  readonly organizationId: OrganizationId;
  readonly agencyId: AgencyId;
  readonly totals: AgencyMetricsProps["totals"];
  readonly computedAt: string;

  private constructor(props: AgencyMetricsProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.agencyId = props.agencyId;
    this.totals = { ...props.totals };
    this.computedAt = props.computedAt;
  }

  static create(
    props: Omit<AgencyMetricsProps, "id" | "computedAt"> & {
      id?: AgencyMetricsSnapshotId;
      computedAt?: string;
    },
  ): AgencyMetrics {
    return new AgencyMetrics({
      id: props.id ?? `ametrics-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      agencyId: props.agencyId,
      totals: props.totals,
      computedAt: props.computedAt ?? new Date().toISOString(),
    });
  }

  toJSON(): AgencyMetricsProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      agencyId: this.agencyId,
      totals: { ...this.totals },
      computedAt: this.computedAt,
    };
  }
}
