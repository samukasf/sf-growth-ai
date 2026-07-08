import type {
  BusinessOpportunityId,
  OpportunityRiskId,
  OpportunityRiskLevel,
} from "../../shared";

export type OpportunityRiskProps = {
  id: OpportunityRiskId;
  opportunityId: BusinessOpportunityId;
  level: OpportunityRiskLevel;
  score: number;
  factors: string[];
  mitigation: string[];
};

export class OpportunityRisk {
  readonly id: OpportunityRiskId;
  readonly opportunityId: BusinessOpportunityId;
  readonly level: OpportunityRiskLevel;
  readonly score: number;
  readonly factors: string[];
  readonly mitigation: string[];

  private constructor(props: OpportunityRiskProps) {
    this.id = props.id;
    this.opportunityId = props.opportunityId;
    this.level = props.level;
    this.score = props.score;
    this.factors = props.factors;
    this.mitigation = props.mitigation;
  }

  static create(
    props: Omit<OpportunityRiskProps, "id"> & { id?: OpportunityRiskId },
  ): OpportunityRisk {
    return new OpportunityRisk({
      id: props.id ?? `risk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      opportunityId: props.opportunityId,
      level: props.level,
      score: Math.max(0, Math.min(100, props.score)),
      factors: props.factors,
      mitigation: props.mitigation,
    });
  }

  toJSON(): OpportunityRiskProps {
    return {
      id: this.id,
      opportunityId: this.opportunityId,
      level: this.level,
      score: this.score,
      factors: this.factors,
      mitigation: this.mitigation,
    };
  }
}
