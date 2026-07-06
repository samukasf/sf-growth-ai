import { clampScore } from "../../shared";
import type {
  LearningRecord,
  LearningScoreBreakdown,
  LearningScoreCalculator,
} from "../../domain";

export class DefaultLearningScoreCalculator implements LearningScoreCalculator {
  calculate(record: LearningRecord): LearningScoreBreakdown {
    const successScore = clampScore(record.successLevel);
    const confidenceScore = clampScore(record.confidence);
    const impactScore = clampScore(record.impact);
    const roiScore = clampScore(Math.min(100, Math.max(0, record.roi * 10 + 50)));
    const feedbackScore = clampScore(record.feedback.length >= 20 ? 80 : record.feedback ? 50 : 20);

    const overallScore = clampScore(
      (successScore + confidenceScore + impactScore + roiScore + feedbackScore) / 5,
    );

    return {
      recordId: record.id,
      overallScore,
      successScore,
      confidenceScore,
      impactScore,
      roiScore,
      feedbackScore,
    };
  }

  meetsValidationThreshold(record: LearningRecord, threshold = 55): boolean {
    return this.calculate(record).overallScore >= threshold;
  }
}
