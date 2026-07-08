import type { AgencyId, AgencyStatus, OrganizationId } from "../../shared";

export type AgencyProps = {
  id: AgencyId;
  organizationId: OrganizationId;
  name: string;
  slug: string;
  status: AgencyStatus;
  createdAt: string;
  updatedAt: string;
};

export class Agency {
  readonly id: AgencyId;
  readonly organizationId: OrganizationId;
  readonly name: string;
  readonly slug: string;
  readonly status: AgencyStatus;
  readonly createdAt: string;
  readonly updatedAt: string;

  private constructor(props: AgencyProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.name = props.name;
    this.slug = props.slug;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<AgencyProps, "id" | "createdAt" | "updatedAt" | "status"> & {
      id?: AgencyId;
      status?: AgencyStatus;
      createdAt?: string;
      updatedAt?: string;
    },
  ): Agency {
    if (!props.name.trim()) throw new Error("name is required");
    const now = new Date().toISOString();
    return new Agency({
      id: props.id ?? `agency-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      name: props.name.trim(),
      slug: props.slug.trim().toLowerCase(),
      status: props.status ?? "active",
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  toJSON(): AgencyProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      name: this.name,
      slug: this.slug,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
