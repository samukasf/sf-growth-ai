import type { AgencyId, OrganizationId, TenantId, TenantSettingsId } from "../../shared";

export type TenantSettingsProps = {
  id: TenantSettingsId;
  organizationId: OrganizationId;
  agencyId: AgencyId;
  tenantId: TenantId;
  features: Record<string, boolean>;
  preferences: Record<string, string>;
  updatedAt: string;
};

export class TenantSettings {
  readonly id: TenantSettingsId;
  readonly organizationId: OrganizationId;
  readonly agencyId: AgencyId;
  readonly tenantId: TenantId;
  readonly features: Record<string, boolean>;
  readonly preferences: Record<string, string>;
  readonly updatedAt: string;

  private constructor(props: TenantSettingsProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.agencyId = props.agencyId;
    this.tenantId = props.tenantId;
    this.features = { ...props.features };
    this.preferences = { ...props.preferences };
    this.updatedAt = props.updatedAt;
  }

  static create(
    props: Omit<TenantSettingsProps, "id" | "updatedAt" | "features" | "preferences"> & {
      id?: TenantSettingsId;
      features?: Record<string, boolean>;
      preferences?: Record<string, string>;
      updatedAt?: string;
    },
  ): TenantSettings {
    return new TenantSettings({
      id: props.id ?? `tsettings-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      agencyId: props.agencyId,
      tenantId: props.tenantId,
      features: props.features ?? {
        companyBrain: true,
        executiveMemory: true,
        executiveCouncil: true,
        executiveTimeline: true,
        executiveDashboard: true,
        executiveMissions: true,
        executiveOpportunities: true,
        executiveProjects: true,
      },
      preferences: props.preferences ?? {
        locale: "pt-BR",
        timezone: "America/Sao_Paulo",
      },
      updatedAt: props.updatedAt ?? new Date().toISOString(),
    });
  }

  toJSON(): TenantSettingsProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      agencyId: this.agencyId,
      tenantId: this.tenantId,
      features: { ...this.features },
      preferences: { ...this.preferences },
      updatedAt: this.updatedAt,
    };
  }
}
