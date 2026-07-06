import type { LearningOutcome, LearningRecord } from "../entities";
import type { Score } from "../../shared";

export type OutcomeEvaluation = {
  recordId: string;
  outcome: ReturnType<LearningOutcome["toJSON"]>;
  successLevel: Score;
  impact: Score;
  roi: number;
  notes: string[];
};

export interface OutcomeEvaluator {
  evaluate(record: LearningRecord): OutcomeEvaluation;
}
