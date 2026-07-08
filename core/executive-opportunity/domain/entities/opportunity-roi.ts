import type { BusinessOpportunityId, OpportunityROIId } from "../../shared";
import { clampRoi } from "../../shared";

export type OpportunityROIProps = {
  id: OpportunityROIId;
  opportunityId: BusinessOpportunityId;
  estimatedReturn: number;
  estimatedCost: number;
  paybackMonths: number;
  annualizedReturn: number;
  confidence: number;
};

export class OpportunityROI {
  readonly id: OpportunityROIId;
  readonly opportunityId: BusinessOpportunityId;
  readonly estimatedReturn: number;
  readonly estimatedCost: number;
  readonly paybackMonths: number;
  readonly annualizedReturn: number;
  readonly confidence: number;

  private constructor(props: OpportunityROIProps) {
    this.id = props.id;
    this.opportunityId = props.opportunityId;
    this.estimatedReturn = props.estimatedReturn;
    this.estimatedCost = props.estimatedCost;
    this.paybackMonths = props.paybackMonths;
    this.annualizedReturn = props.annualizedReturn;
    this.confidence = props.confidence;
  }

  static create(
    props: Omit<OpportunityROIProps, "id"> & { id?: OpportunityROIId },
  ): OpportunityROI {
    return new OpportunityROI({
      id: props.id ?? `roi-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      opportunityId: props.opportunityId,
      estimatedReturn: clampRoi(props.estimatedReturn),
      estimatedCost: clampRoi(props.estimatedCost),
      paybackMonths: Math.max(0, props.paybackMonths),
      annualizedReturn: clampRoi(props.annualizedReturn),
      confidence: Math.max(0, Math.min(100, props.confidence)),
    });
  }

  toJSON(): OpportunityROIProps {
    return {
      id: this.id,
      opportunityId: this.opportunityId,
      estimatedReturn: this.estimatedReturn,
      estimatedCost: this.estimatedCost,
      paybackMonths: this.paybackMonths,
      annualizedReturn: this.annualizedReturn,
      confidence: this.confidence,
    };
  }
}
