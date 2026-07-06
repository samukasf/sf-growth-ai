import type {
  BusinessImprovementId,
  CompanyId,
  InnovationOpportunityId,
  Score,
} from "../../shared";
import { clampScore } from "../../shared";

export type BusinessImprovementType =
  | "cost_reduction"
  | "revenue_increase"
  | "operational_efficiency"
  | "customer_experience"
  | "new_product"
  | "new_service";

export type BusinessImprovementProps = {
  id: BusinessImprovementId;
  companyId: CompanyId;
  opportunityId: InnovationOpportunityId;
  type: BusinessImprovementType;
  title: string;
  description: string;
  expectedImpact: Score;
  implementationEffort: Score;
};

export class BusinessImprovement {
  readonly id: BusinessImprovementId;
  readonly companyId: CompanyId;
  readonly opportunityId: InnovationOpportunityId;
  readonly type: BusinessImprovementType;
  readonly title: string;
  readonly description: string;
  readonly expectedImpact: Score;
  readonly implementationEffort: Score;

  private constructor(props: BusinessImprovementProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.opportunityId = props.opportunityId;
    this.type = props.type;
    this.title = props.title;
    this.description = props.description;
    this.expectedImpact = props.expectedImpact;
    this.implementationEffort = props.implementationEffort;
  }

  static create(
    props: Omit<BusinessImprovementProps, "id"> & { id?: BusinessImprovementId },
  ): BusinessImprovement {
    return new BusinessImprovement({
      id: props.id ?? `improvement-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: props.companyId,
      opportunityId: props.opportunityId,
      type: props.type,
      title: props.title.trim(),
      description: props.description.trim(),
      expectedImpact: clampScore(props.expectedImpact),
      implementationEffort: clampScore(props.implementationEffort),
    });
  }

  toJSON(): BusinessImprovementProps {
    return {
      id: this.id,
      companyId: this.companyId,
      opportunityId: this.opportunityId,
      type: this.type,
      title: this.title,
      description: this.description,
      expectedImpact: this.expectedImpact,
      implementationEffort: this.implementationEffort,
    };
  }
}
