import type { CompanyId, InnovationImpactId, Score } from "../../shared";
import { clampScore } from "../../shared";

export type InnovationImpactArea =
  | "revenue"
  | "cost_reduction"
  | "efficiency"
  | "customer_experience"
  | "operations"
  | "automation";

export type InnovationImpactProps = {
  id: InnovationImpactId;
  companyId: CompanyId;
  area: InnovationImpactArea;
  description: string;
  magnitude: Score;
  timeframeDays: number;
};

export class InnovationImpact {
  readonly id: InnovationImpactId;
  readonly companyId: CompanyId;
  readonly area: InnovationImpactArea;
  readonly description: string;
  readonly magnitude: Score;
  readonly timeframeDays: number;

  private constructor(props: InnovationImpactProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.area = props.area;
    this.description = props.description;
    this.magnitude = props.magnitude;
    this.timeframeDays = props.timeframeDays;
  }

  static create(
    props: Omit<InnovationImpactProps, "id"> & { id?: InnovationImpactId },
  ): InnovationImpact {
    return new InnovationImpact({
      id: props.id ?? `impact-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: props.companyId,
      area: props.area,
      description: props.description.trim(),
      magnitude: clampScore(props.magnitude),
      timeframeDays: Math.max(1, props.timeframeDays),
    });
  }

  toJSON(): InnovationImpactProps {
    return {
      id: this.id,
      companyId: this.companyId,
      area: this.area,
      description: this.description,
      magnitude: this.magnitude,
      timeframeDays: this.timeframeDays,
    };
  }
}
