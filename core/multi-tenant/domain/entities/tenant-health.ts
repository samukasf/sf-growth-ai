import type { AgencyId, OrganizationId, TenantHealthId, TenantId } from "../../shared";

export type TenantHealthScore = {
  overall: number;
  isolation: number;
  subscription: number;
  limits: number;
  executiveStack: number;
};

export type TenantHealthProps = {
  id: TenantHealthId;
  organizationId: OrganizationId;
  agencyId: AgencyId;
  tenantId: TenantId;
  scores: TenantHealthScore;
  signals: string[];
  evaluatedAt: string;
};

export class TenantHealth {
  readonly id: TenantHealthId;
  readonly organizationId: OrganizationId;
  readonly agencyId: AgencyId;
  readonly tenantId: TenantId;
  readonly scores: TenantHealthScore;
  readonly signals: string[];
  readonly evaluatedAt: string;

  private constructor(props: TenantHealthProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.agencyId = props.agencyId;
    this.tenantId = props.tenantId;
    this.scores = { ...props.scores };
    this.signals = [...props.signals];
    this.evaluatedAt = props.evaluatedAt;
  }

  static create(
    props: Omit<TenantHealthProps, "id" | "evaluatedAt"> & {
      id?: TenantHealthId;
      evaluatedAt?: string;
    },
  ): TenantHealth {
    return new TenantHealth({
      id: props.id ?? `thealth-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      agencyId: props.agencyId,
      tenantId: props.tenantId,
      scores: props.scores,
      signals: props.signals,
      evaluatedAt: props.evaluatedAt ?? new Date().toISOString(),
    });
  }

  toJSON(): TenantHealthProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      agencyId: this.agencyId,
      tenantId: this.tenantId,
      scores: { ...this.scores },
      signals: [...this.signals],
      evaluatedAt: this.evaluatedAt,
    };
  }
}
