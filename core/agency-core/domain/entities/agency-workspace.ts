import type { AgencyId, AgencyWorkspaceId, OrganizationId } from "../../shared";

export type AgencyWorkspaceProps = {
  id: AgencyWorkspaceId;
  organizationId: OrganizationId;
  agencyId: AgencyId;
  name: string;
  timezone: string;
  locale: string;
  createdAt: string;
};

export class AgencyWorkspace {
  readonly id: AgencyWorkspaceId;
  readonly organizationId: OrganizationId;
  readonly agencyId: AgencyId;
  readonly name: string;
  readonly timezone: string;
  readonly locale: string;
  readonly createdAt: string;

  private constructor(props: AgencyWorkspaceProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.agencyId = props.agencyId;
    this.name = props.name;
    this.timezone = props.timezone;
    this.locale = props.locale;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<AgencyWorkspaceProps, "id" | "createdAt"> & {
      id?: AgencyWorkspaceId;
      createdAt?: string;
    },
  ): AgencyWorkspace {
    return new AgencyWorkspace({
      id: props.id ?? `awsp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      agencyId: props.agencyId,
      name: props.name.trim(),
      timezone: props.timezone,
      locale: props.locale,
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  toJSON(): AgencyWorkspaceProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      agencyId: this.agencyId,
      name: this.name,
      timezone: this.timezone,
      locale: this.locale,
      createdAt: this.createdAt,
    };
  }
}
