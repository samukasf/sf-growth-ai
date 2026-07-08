import type { AgencyHealthId, AgencyId, OrganizationId } from "../../shared";

export type AgencyHealthScore = {
  overall: number;
  clients: number;
  projects: number;
  teams: number;
  goals: number;
};

export type AgencyHealthProps = {
  id: AgencyHealthId;
  organizationId: OrganizationId;
  agencyId: AgencyId;
  scores: AgencyHealthScore;
  signals: string[];
  evaluatedAt: string;
};

export class AgencyHealth {
  readonly id: AgencyHealthId;
  readonly organizationId: OrganizationId;
  readonly agencyId: AgencyId;
  readonly scores: AgencyHealthScore;
  readonly signals: string[];
  readonly evaluatedAt: string;

  private constructor(props: AgencyHealthProps) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.agencyId = props.agencyId;
    this.scores = { ...props.scores };
    this.signals = [...props.signals];
    this.evaluatedAt = props.evaluatedAt;
  }

  static create(
    props: Omit<AgencyHealthProps, "id" | "evaluatedAt"> & {
      id?: AgencyHealthId;
      evaluatedAt?: string;
    },
  ): AgencyHealth {
    return new AgencyHealth({
      id: props.id ?? `ahealth-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      organizationId: props.organizationId,
      agencyId: props.agencyId,
      scores: props.scores,
      signals: props.signals,
      evaluatedAt: props.evaluatedAt ?? new Date().toISOString(),
    });
  }

  toJSON(): AgencyHealthProps {
    return {
      id: this.id,
      organizationId: this.organizationId,
      agencyId: this.agencyId,
      scores: { ...this.scores },
      signals: [...this.signals],
      evaluatedAt: this.evaluatedAt,
    };
  }
}
