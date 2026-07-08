import type { AgencyId, OrganizationId, TenantId, TenantWorkspaceId } from "../../shared";

export type TenantWorkspaceProps = {
  id: TenantWorkspaceId;
  organizationId: OrganizationId;
  agencyId: AgencyId;
  tenantId: TenantId;
  name: string;
  isolationKey: string;
  timezone: string;
  locale: string;
  createdAt: string;
};

export class TenantWorkspace {
  readonly id: TenantWorkspaceId;
  readonly organizationId: OrganizationId;
  readonly agencyId: AgencyId;
  readonly tenantId: TenantId;
  readonly name: string;
  readonly isolationKey: string;
  readonly timezone: string;
  readonly locale: string;
  readonly createdAt: string;

  private constructor(props: TenantWorkspaceProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.agencyId = props.agencyId;
    this.tenantId = props.tenantId;
    this.name = props.name;
    this.isolationKey = props.isolationKey;
    this.timezone = props.timezone;
    this.locale = props.locale;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<TenantWorkspaceProps, "id" | "createdAt" | "isolationKey"> & {
      id?: TenantWorkspaceId;
      isolationKey?: string;
      createdAt?: string;
    },
  ): TenantWorkspace {
    return new TenantWorkspace({
      id: props.id ?? `twsp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      agencyId: props.agencyId,
      tenantId: props.tenantId,
      name: props.name.trim(),
      isolationKey:
        props.isolationKey ??
        `iso-${props.organizationId}-${props.agencyId}-${props.tenantId}`,
      timezone: props.timezone,
      locale: props.locale,
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  toJSON(): TenantWorkspaceProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      agencyId: this.agencyId,
      tenantId: this.tenantId,
      name: this.name,
      isolationKey: this.isolationKey,
      timezone: this.timezone,
      locale: this.locale,
      createdAt: this.createdAt,
    };
  }
}
