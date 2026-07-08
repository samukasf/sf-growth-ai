import type { AgencyId, OrganizationId, TenantId, TenantIdentityId } from "../../shared";

export type TenantIdentityProps = {
  id: TenantIdentityId;
  organizationId: OrganizationId;
  agencyId: AgencyId;
  tenantId: TenantId;
  displayName: string;
  legalName?: string;
  taxId?: string;
  primaryDomain?: string;
  createdAt: string;
};

export class TenantIdentity {
  readonly id: TenantIdentityId;
  readonly organizationId: OrganizationId;
  readonly agencyId: AgencyId;
  readonly tenantId: TenantId;
  readonly displayName: string;
  readonly legalName?: string;
  readonly taxId?: string;
  readonly primaryDomain?: string;
  readonly createdAt: string;

  private constructor(props: TenantIdentityProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.agencyId = props.agencyId;
    this.tenantId = props.tenantId;
    this.displayName = props.displayName;
    this.legalName = props.legalName;
    this.taxId = props.taxId;
    this.primaryDomain = props.primaryDomain;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<TenantIdentityProps, "id" | "createdAt"> & {
      id?: TenantIdentityId;
      createdAt?: string;
    },
  ): TenantIdentity {
    return new TenantIdentity({
      id: props.id ?? `tidentity-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      agencyId: props.agencyId,
      tenantId: props.tenantId,
      displayName: props.displayName.trim(),
      legalName: props.legalName,
      taxId: props.taxId,
      primaryDomain: props.primaryDomain,
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  toJSON(): TenantIdentityProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      agencyId: this.agencyId,
      tenantId: this.tenantId,
      displayName: this.displayName,
      legalName: this.legalName,
      taxId: this.taxId,
      primaryDomain: this.primaryDomain,
      createdAt: this.createdAt,
    };
  }
}
