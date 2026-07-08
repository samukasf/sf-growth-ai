import type { BusinessOpportunityId, OpportunityImpactId } from "../../shared";
import { clampScore } from "../../shared";

export type OpportunityImpactProps = {
  id: OpportunityImpactId;
  opportunityId: BusinessOpportunityId;
  score: number;
  revenueImpact: number;
  costImpact: number;
  efficiencyImpact: number;
  customerImpact: number;
  summary: string;
};

export class OpportunityImpact {
  readonly id: OpportunityImpactId;
  readonly opportunityId: BusinessOpportunityId;
  readonly score: number;
  readonly revenueImpact: number;
  readonly costImpact: number;
  readonly efficiencyImpact: number;
  readonly customerImpact: number;
  readonly summary: string;

  private constructor(props: OpportunityImpactProps) {
    this.id = props.id;
    this.opportunityId = props.opportunityId;
    this.score = props.score;
    this.revenueImpact = props.revenueImpact;
    this.costImpact = props.costImpact;
    this.efficiencyImpact = props.efficiencyImpact;
    this.customerImpact = props.customerImpact;
    this.summary = props.summary;
  }

  static create(
    props: Omit<OpportunityImpactProps, "id"> & { id?: OpportunityImpactId },
  ): OpportunityImpact {
    return new OpportunityImpact({
      id: props.id ?? `impact-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      opportunityId: props.opportunityId,
      score: clampScore(props.score),
      revenueImpact: clampScore(props.revenueImpact),
      costImpact: clampScore(props.costImpact),
      efficiencyImpact: clampScore(props.efficiencyImpact),
      customerImpact: clampScore(props.customerImpact),
      summary: props.summary,
    });
  }

  toJSON(): OpportunityImpactProps {
    return {
      id: this.id,
      opportunityId: this.opportunityId,
      score: this.score,
      revenueImpact: this.revenueImpact,
      costImpact: this.costImpact,
      efficiencyImpact: this.efficiencyImpact,
      customerImpact: this.customerImpact,
      summary: this.summary,
    };
  }
}
