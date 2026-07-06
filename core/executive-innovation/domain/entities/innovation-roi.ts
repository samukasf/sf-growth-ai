import type { CompanyId, InnovationROIId } from "../../shared";

export type InnovationROIProps = {
  id: InnovationROIId;
  companyId: CompanyId;
  opportunityId: string;
  estimatedReturn: number;
  estimatedCost: number;
  paybackMonths: number;
  confidence: number;
};

export class InnovationROI {
  readonly id: InnovationROIId;
  readonly companyId: CompanyId;
  readonly opportunityId: string;
  readonly estimatedReturn: number;
  readonly estimatedCost: number;
  readonly paybackMonths: number;
  readonly confidence: number;

  private constructor(props: InnovationROIProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.opportunityId = props.opportunityId;
    this.estimatedReturn = props.estimatedReturn;
    this.estimatedCost = props.estimatedCost;
    this.paybackMonths = props.paybackMonths;
    this.confidence = props.confidence;
  }

  static create(
    props: Omit<InnovationROIProps, "id"> & { id?: InnovationROIId },
  ): InnovationROI {
    return new InnovationROI({
      id: props.id ?? `roi-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: props.companyId,
      opportunityId: props.opportunityId,
      estimatedReturn: props.estimatedReturn,
      estimatedCost: Math.max(0, props.estimatedCost),
      paybackMonths: Math.max(0, props.paybackMonths),
      confidence: props.confidence,
    });
  }

  get roiRatio(): number {
    if (this.estimatedCost === 0) return this.estimatedReturn > 0 ? Infinity : 0;
    return this.estimatedReturn / this.estimatedCost;
  }

  toJSON(): InnovationROIProps & { roiRatio: number } {
    return {
      id: this.id,
      companyId: this.companyId,
      opportunityId: this.opportunityId,
      estimatedReturn: this.estimatedReturn,
      estimatedCost: this.estimatedCost,
      paybackMonths: this.paybackMonths,
      confidence: this.confidence,
      roiRatio: this.roiRatio,
    };
  }
}
