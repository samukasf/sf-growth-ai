import type { CompanyId, LearningHypothesisId, LearningRecordId, Score } from "../../shared";
import { clampScore } from "../../shared";

export type LearningHypothesisStatus = "proposed" | "testing" | "validated" | "rejected";

export type LearningHypothesisProps = {
  id: LearningHypothesisId;
  companyId: CompanyId;
  recordId: LearningRecordId;
  statement: string;
  rationale: string;
  confidence: Score;
  status: LearningHypothesisStatus;
  createdAt: string;
  validatedAt?: string;
};

export class LearningHypothesis {
  readonly id: LearningHypothesisId;
  readonly companyId: CompanyId;
  readonly recordId: LearningRecordId;
  readonly statement: string;
  readonly rationale: string;
  readonly confidence: Score;
  readonly status: LearningHypothesisStatus;
  readonly createdAt: string;
  readonly validatedAt?: string;

  private constructor(props: LearningHypothesisProps) {
    this.id = props.id;
    this.companyId = props.companyId;
    this.recordId = props.recordId;
    this.statement = props.statement;
    this.rationale = props.rationale;
    this.confidence = props.confidence;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.validatedAt = props.validatedAt;
  }

  static create(
    props: Omit<LearningHypothesisProps, "id" | "createdAt" | "status"> & {
      id?: LearningHypothesisId;
      createdAt?: string;
      status?: LearningHypothesisStatus;
    },
  ): LearningHypothesis {
    if (!props.statement.trim()) {
      throw new Error("Learning hypothesis statement is required");
    }

    return new LearningHypothesis({
      id: props.id ?? `hypothesis-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyId: props.companyId,
      recordId: props.recordId,
      statement: props.statement.trim(),
      rationale: props.rationale.trim(),
      confidence: clampScore(props.confidence),
      status: props.status ?? "proposed",
      createdAt: props.createdAt ?? new Date().toISOString(),
      validatedAt: props.validatedAt,
    });
  }

  validate(): LearningHypothesis {
    return new LearningHypothesis({
      ...this.toJSON(),
      status: "validated",
      validatedAt: new Date().toISOString(),
      confidence: clampScore(this.confidence + 10),
    });
  }

  toJSON(): LearningHypothesisProps {
    return {
      id: this.id,
      companyId: this.companyId,
      recordId: this.recordId,
      statement: this.statement,
      rationale: this.rationale,
      confidence: this.confidence,
      status: this.status,
      createdAt: this.createdAt,
      validatedAt: this.validatedAt,
    };
  }
}
