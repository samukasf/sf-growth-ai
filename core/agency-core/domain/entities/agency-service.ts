import type { AgencyId, AgencyServiceId, OrganizationId } from "../../shared";

export type AgencyServiceCategory =
  | "strategy"
  | "branding"
  | "media"
  | "content"
  | "performance"
  | "automation";

export type AgencyServiceProps = {
  id: AgencyServiceId;
  organizationId: OrganizationId;
  agencyId: AgencyId;
  name: string;
  category: AgencyServiceCategory;
  description?: string;
  createdAt: string;
};

export class AgencyService {
  readonly id: AgencyServiceId;
  readonly organizationId: OrganizationId;
  readonly agencyId: AgencyId;
  readonly name: string;
  readonly category: AgencyServiceCategory;
  readonly description?: string;
  readonly createdAt: string;

  private constructor(props: AgencyServiceProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.agencyId = props.agencyId;
    this.name = props.name;
    this.category = props.category;
    this.description = props.description;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<AgencyServiceProps, "id" | "createdAt"> & {
      id?: AgencyServiceId;
      createdAt?: string;
    },
  ): AgencyService {
    return new AgencyService({
      id: props.id ?? `asvc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      agencyId: props.agencyId,
      name: props.name.trim(),
      category: props.category,
      description: props.description,
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  toJSON(): AgencyServiceProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      agencyId: this.agencyId,
      name: this.name,
      category: this.category,
      description: this.description,
      createdAt: this.createdAt,
    };
  }
}
