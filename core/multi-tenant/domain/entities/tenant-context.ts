import type { AgencyId, OrganizationId, TenantContextId, TenantId } from "../../shared";

export type TenantContextProps = {
  id: TenantContextId;
  organizationId: OrganizationId;
  agencyId: AgencyId;
  tenantId: TenantId;
  isolationKey: string;
  operationalContext: Record<string, string>;
  executiveContext: Record<string, string>;
  assembledAt: string;
};

export class TenantContext {
  readonly id: TenantContextId;
  readonly organizationId: OrganizationId;
  readonly agencyId: AgencyId;
  readonly tenantId: TenantId;
  readonly isolationKey: string;
  readonly operationalContext: Record<string, string>;
  readonly executiveContext: Record<string, string>;
  readonly assembledAt: string;

  private constructor(props: TenantContextProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.agencyId = props.agencyId;
    this.tenantId = props.tenantId;
    this.isolationKey = props.isolationKey;
    this.operationalContext = { ...props.operationalContext };
    this.executiveContext = { ...props.executiveContext };
    this.assembledAt = props.assembledAt;
  }

  static create(
    props: Omit<TenantContextProps, "id" | "assembledAt"> & {
      id?: TenantContextId;
      assembledAt?: string;
    },
  ): TenantContext {
    return new TenantContext({
      id: props.id ?? `tctx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      agencyId: props.agencyId,
      tenantId: props.tenantId,
      isolationKey: props.isolationKey,
      operationalContext: props.operationalContext,
      executiveContext: props.executiveContext,
      assembledAt: props.assembledAt ?? new Date().toISOString(),
    });
  }

  toJSON(): TenantContextProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      agencyId: this.agencyId,
      tenantId: this.tenantId,
      isolationKey: this.isolationKey,
      operationalContext: { ...this.operationalContext },
      executiveContext: { ...this.executiveContext },
      assembledAt: this.assembledAt,
    };
  }
}
