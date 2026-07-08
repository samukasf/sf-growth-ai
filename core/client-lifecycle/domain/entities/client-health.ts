import type {
  AgencyId,
  ClientHealthId,
  CompanyId,
  OrganizationId,
} from "../../shared";

export type ClientHealthScore = {
  overall: number;
  engagement: number;
  performance: number;
  relationship: number;
  growth: number;
};

export type ClientHealthProps = {
  id: ClientHealthId;
  organizationId: OrganizationId;
  agencyId: AgencyId;
  companyId: CompanyId;
  scores: ClientHealthScore;
  growthScore: number;
  signals: string[];
  evaluatedAt: string;
};

export class ClientHealth {
  readonly id: ClientHealthId;
  readonly organizationId: OrganizationId;
  readonly agencyId: AgencyId;
  readonly companyId: CompanyId;
  readonly scores: ClientHealthScore;
  readonly growthScore: number;
  readonly signals: string[];
  readonly evaluatedAt: string;

  private constructor(props: ClientHealthProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.agencyId = props.agencyId;
    this.companyId = props.companyId;
    this.scores = { ...props.scores };
    this.growthScore = props.growthScore;
    this.signals = [...props.signals];
    this.evaluatedAt = props.evaluatedAt;
  }

  static create(
    props: Omit<ClientHealthProps, "id" | "evaluatedAt"> & {
      id?: ClientHealthId;
      evaluatedAt?: string;
    },
  ): ClientHealth {
    return new ClientHealth({
      id: props.id ?? `chealth-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      agencyId: props.agencyId,
      companyId: props.companyId,
      scores: props.scores,
      growthScore: props.growthScore,
      signals: props.signals,
      evaluatedAt: props.evaluatedAt ?? new Date().toISOString(),
    });
  }

  isAtRisk(): boolean {
    return this.scores.overall < 60;
  }

  toJSON(): ClientHealthProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      agencyId: this.agencyId,
      companyId: this.companyId,
      scores: { ...this.scores },
      growthScore: this.growthScore,
      signals: [...this.signals],
      evaluatedAt: this.evaluatedAt,
    };
  }
}
