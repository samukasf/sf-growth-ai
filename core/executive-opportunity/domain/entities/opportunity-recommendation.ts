import type { BusinessOpportunityId, OpportunityRecommendationId } from "../../shared";

export type OpportunityRecommendationProps = {
  id: OpportunityRecommendationId;
  opportunityId: BusinessOpportunityId;
  title: string;
  description: string;
  department: string;
  order: number;
  expectedOutcome: string;
};

export class OpportunityRecommendation {
  readonly id: OpportunityRecommendationId;
  readonly opportunityId: BusinessOpportunityId;
  readonly title: string;
  readonly description: string;
  readonly department: string;
  readonly order: number;
  readonly expectedOutcome: string;

  private constructor(props: OpportunityRecommendationProps) {
    this.id = props.id;
    this.opportunityId = props.opportunityId;
    this.title = props.title;
    this.description = props.description;
    this.department = props.department;
    this.order = props.order;
    this.expectedOutcome = props.expectedOutcome;
  }

  static create(
    props: Omit<OpportunityRecommendationProps, "id"> & { id?: OpportunityRecommendationId },
  ): OpportunityRecommendation {
    return new OpportunityRecommendation({
      id: props.id ?? `rec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      opportunityId: props.opportunityId,
      title: props.title,
      description: props.description,
      department: props.department,
      order: props.order,
      expectedOutcome: props.expectedOutcome,
    });
  }

  toJSON(): OpportunityRecommendationProps {
    return {
      id: this.id,
      opportunityId: this.opportunityId,
      title: this.title,
      description: this.description,
      department: this.department,
      order: this.order,
      expectedOutcome: this.expectedOutcome,
    };
  }
}
