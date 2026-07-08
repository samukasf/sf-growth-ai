import type { BusinessOpportunityId, OpportunityEvidenceId } from "../../shared";

export type OpportunityEvidenceProps = {
  id: OpportunityEvidenceId;
  opportunityId: BusinessOpportunityId;
  source: string;
  dataPoints: string[];
  collectedAt: string;
  confidence: number;
};

export class OpportunityEvidence {
  readonly id: OpportunityEvidenceId;
  readonly opportunityId: BusinessOpportunityId;
  readonly source: string;
  readonly dataPoints: string[];
  readonly collectedAt: string;
  readonly confidence: number;

  private constructor(props: OpportunityEvidenceProps) {
    this.id = props.id;
    this.opportunityId = props.opportunityId;
    this.source = props.source;
    this.dataPoints = props.dataPoints;
    this.collectedAt = props.collectedAt;
    this.confidence = props.confidence;
  }

  static create(
    props: Omit<OpportunityEvidenceProps, "id" | "collectedAt"> & {
      id?: OpportunityEvidenceId;
      collectedAt?: string;
    },
  ): OpportunityEvidence {
    return new OpportunityEvidence({
      id: props.id ?? `evidence-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      opportunityId: props.opportunityId,
      source: props.source,
      dataPoints: props.dataPoints,
      collectedAt: props.collectedAt ?? new Date().toISOString(),
      confidence: Math.max(0, Math.min(100, props.confidence)),
    });
  }

  toJSON(): OpportunityEvidenceProps {
    return {
      id: this.id,
      opportunityId: this.opportunityId,
      source: this.source,
      dataPoints: this.dataPoints,
      collectedAt: this.collectedAt,
      confidence: this.confidence,
    };
  }
}
