import type { CompanyId, InnovationHypothesisId, InnovationOpportunityId, Score } from "../../shared";
import { clampScore } from "../../shared";

export type InnovationHypothesisStatus = "proposed" | "testing" | "validated" | "rejected";

export type InnovationHypothesisProps = {
  id: InnovationHypothesisId;
  companyId: CompanyId;
  opportunityId: InnovationOpportunityId;
  statement: string;
  rationale: string;
  confidence: Score;
  status: InnovationHypothesisStatus;
  createdAt: string;
};

export class InnovationHypothesis {
  readonly id: InnovationHypothesisId;
  readonly companyId: CompanyId;
  readonly opportunityId: InnovationOpportunityId;
  readonly statement: string;
  readonly rationale: string;
  readonly confidence: Score;
  readonly status: InnovationHypothesisStatus;
  readonly createdAt: string;

  private constructor(props: InnovationHypothesisProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.opportunityId = props.opportunityId;
    this.statement = props.statement;
    this.rationale = props.rationale;
    this.confidence = props.confidence;
    this.status = props.status;
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<InnovationHypothesisProps, "id" | "createdAt" | "status"> & {
      id?: InnovationHypothesisId;
      createdAt?: string;
      status?: InnovationHypothesisStatus;
    },
  ): InnovationHypothesis {
    return new InnovationHypothesis({
      id: props.id ?? `hypothesis-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: props.companyId,
      opportunityId: props.opportunityId,
      statement: props.statement.trim(),
      rationale: props.rationale.trim(),
      confidence: clampScore(props.confidence),
      status: props.status ?? "proposed",
      createdAt: props.createdAt ?? new Date().toISOString(),
    });
  }

  toJSON(): InnovationHypothesisProps {
    return {
      id: this.id,
      companyId: this.companyId,
      opportunityId: this.opportunityId,
      statement: this.statement,
      rationale: this.rationale,
      confidence: this.confidence,
      status: this.status,
      createdAt: this.createdAt,
    };
  }
}
