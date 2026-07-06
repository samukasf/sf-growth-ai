import type {
  CompanyId,
  InnovationOpportunityId,
  Score,
  SoftwareOpportunityId,
} from "../../shared";
import { clampScore } from "../../shared";

export type SoftwareCategory =
  | "scheduling"
  | "delivery"
  | "crm"
  | "dashboard"
  | "whatsapp_support"
  | "landing_page"
  | "internal_tool"
  | "integration"
  | "other";

export type SoftwareOpportunityProps = {
  id: SoftwareOpportunityId;
  companyId: CompanyId;
  opportunityId: InnovationOpportunityId;
  category: SoftwareCategory;
  title: string;
  description: string;
  businessJustification: string;
  complexity: Score;
  estimatedBuildDays: number;
};

export class SoftwareOpportunity {
  readonly id: SoftwareOpportunityId;
  readonly companyId: CompanyId;
  readonly opportunityId: InnovationOpportunityId;
  readonly category: SoftwareCategory;
  readonly title: string;
  readonly description: string;
  readonly businessJustification: string;
  readonly complexity: Score;
  readonly estimatedBuildDays: number;

  private constructor(props: SoftwareOpportunityProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.opportunityId = props.opportunityId;
    this.category = props.category;
    this.title = props.title;
    this.description = props.description;
    this.businessJustification = props.businessJustification;
    this.complexity = props.complexity;
    this.estimatedBuildDays = props.estimatedBuildDays;
  }

  static create(
    props: Omit<SoftwareOpportunityProps, "id"> & { id?: SoftwareOpportunityId },
  ): SoftwareOpportunity {
    return new SoftwareOpportunity({
      id: props.id ?? `software-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: props.companyId,
      opportunityId: props.opportunityId,
      category: props.category,
      title: props.title.trim(),
      description: props.description.trim(),
      businessJustification: props.businessJustification.trim(),
      complexity: clampScore(props.complexity),
      estimatedBuildDays: Math.max(1, props.estimatedBuildDays),
    });
  }

  toJSON(): SoftwareOpportunityProps {
    return {
      id: this.id,
      companyId: this.companyId,
      opportunityId: this.opportunityId,
      category: this.category,
      title: this.title,
      description: this.description,
      businessJustification: this.businessJustification,
      complexity: this.complexity,
      estimatedBuildDays: this.estimatedBuildDays,
    };
  }
}
