import type { AgencyDashboardId, AgencyId, OrganizationId } from "../../shared";

export type AgencyDashboardSection = {
  key: string;
  label: string;
  metrics: Record<string, number>;
};

export type AgencyDashboardProps = {
  id: AgencyDashboardId;
  organizationId: OrganizationId;
  agencyId: AgencyId;
  sections: AgencyDashboardSection[];
  builtAt: string;
};

export class AgencyDashboard {
  readonly id: AgencyDashboardId;
  readonly organizationId: OrganizationId;
  readonly agencyId: AgencyId;
  readonly sections: AgencyDashboardSection[];
  readonly builtAt: string;

  private constructor(props: AgencyDashboardProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.agencyId = props.agencyId;
    this.sections = props.sections.map((section) => ({
      ...section,
      metrics: { ...section.metrics },
    }));
    this.builtAt = props.builtAt;
  }

  static create(
    props: Omit<AgencyDashboardProps, "id" | "builtAt"> & {
      id?: AgencyDashboardId;
      builtAt?: string;
    },
  ): AgencyDashboard {
    return new AgencyDashboard({
      id: props.id ?? `adash-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      agencyId: props.agencyId,
      sections: props.sections,
      builtAt: props.builtAt ?? new Date().toISOString(),
    });
  }

  toJSON(): AgencyDashboardProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      agencyId: this.agencyId,
      sections: this.sections.map((section) => ({
        ...section,
        metrics: { ...section.metrics },
      })),
      builtAt: this.builtAt,
    };
  }
}
