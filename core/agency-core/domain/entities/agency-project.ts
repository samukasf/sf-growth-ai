import type {
  AgencyClientId,
  AgencyId,
  AgencyProjectId,
  AgencyProjectStatus,
  AgencyServiceId,
  OrganizationId,
} from "../../shared";

export type AgencyProjectProps = {
  id: AgencyProjectId;
  organizationId: OrganizationId;
  agencyId: AgencyId;
  clientId: AgencyClientId;
  serviceId: AgencyServiceId;
  name: string;
  status: AgencyProjectStatus;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
};

export class AgencyProject {
  readonly id: AgencyProjectId;
  readonly organizationId: OrganizationId;
  readonly agencyId: AgencyId;
  readonly clientId: AgencyClientId;
  readonly serviceId: AgencyServiceId;
  readonly name: string;
  readonly status: AgencyProjectStatus;
  readonly startedAt?: string;
  readonly completedAt?: string;
  readonly createdAt: string;

  private constructor(props: AgencyProjectProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.agencyId = props.agencyId;
    this.clientId = props.clientId;
    this.serviceId = props.serviceId;
    this.name = props.name;
    this.status = props.status;
    this.startedAt = props.startedAt;
    this.completedAt = props.completedAt;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<AgencyProjectProps, "id" | "createdAt" | "status"> & {
      id?: AgencyProjectId;
      status?: AgencyProjectStatus;
      createdAt?: string;
    },
  ): AgencyProject {
    return new AgencyProject({
      id: props.id ?? `aproj-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      agencyId: props.agencyId,
      clientId: props.clientId,
      serviceId: props.serviceId,
      name: props.name.trim(),
      status: props.status ?? "draft",
      startedAt: props.startedAt,
      completedAt: props.completedAt,
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  start(): AgencyProject {
    return AgencyProject.create({
      ...this.toJSON(),
      status: "active",
      startedAt: new Date().toISOString(),
    });
  }

  complete(): AgencyProject {
    return AgencyProject.create({
      ...this.toJSON(),
      status: "completed",
      completedAt: new Date().toISOString(),
    });
  }

  toJSON(): AgencyProjectProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      agencyId: this.agencyId,
      clientId: this.clientId,
      serviceId: this.serviceId,
      name: this.name,
      status: this.status,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      createdAt: this.createdAt,
    };
  }
}
