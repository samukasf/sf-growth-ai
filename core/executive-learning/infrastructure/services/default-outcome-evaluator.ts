import { clampScore } from "../../shared";
import type { LearningRecord, OutcomeEvaluator, OutcomeEvaluation } from "../../domain";

const STATUS_SUCCESS_MAP: Record<string, number> = {
  success: 85,
  partial: 60,
  failure: 25,
  pending: 40,
  unknown: 50,
};

export class DefaultOutcomeEvaluator implements OutcomeEvaluator {
  evaluate(record: LearningRecord): OutcomeEvaluation {
    const successLevel = clampScore(
      STATUS_SUCCESS_MAP[record.outcome.status] ?? record.successLevel,
    );
    const impact = clampScore(record.impact || successLevel);
    const roi = record.roi !== 0 ? record.roi : successLevel >= 70 ? 1 : successLevel < 40 ? -1 : 0;

    const notes: string[] = [];
    if (record.outcome.status === "failure") {
      notes.push("Failure outcome detected — capture corrective actions");
    }
    if (record.outcome.status === "success" && record.roi > 0) {
      notes.push("Successful outcome with positive ROI");
    }

    return {
      recordId: record.id,
      outcome: record.outcome.toJSON(),
      successLevel,
      impact,
      roi,
      notes,
    };
  }
}
