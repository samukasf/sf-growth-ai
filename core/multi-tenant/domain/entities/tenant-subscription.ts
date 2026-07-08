import type {
  AgencyId,
  OrganizationId,
  TenantId,
  TenantSubscriptionId,
  TenantSubscriptionPlan,
  TenantSubscriptionStatus,
} from "../../shared";

export type TenantSubscriptionProps = {
  id: TenantSubscriptionId;
  organizationId: OrganizationId;
  agencyId: AgencyId;
  tenantId: TenantId;
  plan: TenantSubscriptionPlan;
  status: TenantSubscriptionStatus;
  startedAt: string;
  expiresAt?: string;
};

export class TenantSubscription {
  readonly id: TenantSubscriptionId;
  readonly organizationId: OrganizationId;
  readonly agencyId: AgencyId;
  readonly tenantId: TenantId;
  readonly plan: TenantSubscriptionPlan;
  readonly status: TenantSubscriptionStatus;
  readonly startedAt: string;
  readonly expiresAt?: string;

  private constructor(props: TenantSubscriptionProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.agencyId = props.agencyId;
    this.tenantId = props.tenantId;
    this.plan = props.plan;
    this.status = props.status;
    this.startedAt = props.startedAt;
    this.expiresAt = props.expiresAt;
  }

  static create(
    props: Omit<TenantSubscriptionProps, "id" | "startedAt" | "status"> & {
      id?: TenantSubscriptionId;
      status?: TenantSubscriptionStatus;
      startedAt?: string;
    },
  ): TenantSubscription {
    return new TenantSubscription({
      id: props.id ?? `tsub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      agencyId: props.agencyId,
      tenantId: props.tenantId,
      plan: props.plan,
      status: props.status ?? "trial",
      startedAt: props.startedAt ?? new Date().toISOString(),
      expiresAt: props.expiresAt,
    });
  }

  toJSON(): TenantSubscriptionProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      agencyId: this.agencyId,
      tenantId: this.tenantId,
      plan: this.plan,
      status: this.status,
      startedAt: this.startedAt,
      expiresAt: this.expiresAt,
    };
  }
}
