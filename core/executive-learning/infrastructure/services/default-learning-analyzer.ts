import type { LearningAnalyzer, LearningAnalysisReport, LearningRecord } from "../../domain";

export class DefaultLearningAnalyzer implements LearningAnalyzer {
  analyze(record: LearningRecord): LearningAnalysisReport {
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (record.successLevel >= 70) {
      strengths.push("High success level achieved");
    } else if (record.successLevel < 40) {
      weaknesses.push("Low success level requires review");
    }

    if (record.roi > 0) {
      strengths.push(`Positive ROI: ${record.roi}`);
    } else if (record.roi < 0) {
      weaknesses.push(`Negative ROI: ${record.roi}`);
    }

    if (record.lessonsLearned.length === 0) {
      weaknesses.push("No lessons captured yet");
    }

    return {
      recordId: record.id,
      summary: `Learning analysis for outcome: ${record.outcome.description}`,
      strengths,
      weaknesses,
      suggestedLessons:
        record.lessonsLearned.length > 0
          ? record.lessonsLearned
          : [`Review outcome: ${record.outcome.status}`],
      suggestedRecommendations:
        record.recommendations.length > 0
          ? record.recommendations
          : ["Document next action based on this learning"],
    };
  }

  analyzeBatch(records: LearningRecord[]): LearningAnalysisReport[] {
    return records.map((record) => this.analyze(record));
  }
}
