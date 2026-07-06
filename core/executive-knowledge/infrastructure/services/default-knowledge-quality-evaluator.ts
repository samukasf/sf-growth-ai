import { clampScore } from "../../shared";
import type {
  KnowledgeQualityEvaluator,
  KnowledgeQualityReport,
  KnowledgeRecord,
} from "../../domain";

export class DefaultKnowledgeQualityEvaluator implements KnowledgeQualityEvaluator {
  evaluate(record: KnowledgeRecord): KnowledgeQualityReport {
    const issues: string[] = [];
    const recommendations: string[] = [];

    const titleScore = record.title.length >= 8 ? 100 : 40;
    const summaryScore = record.summary.length >= 20 ? 100 : record.summary.length > 0 ? 60 : 20;
    const contentScore = record.content.length >= 50 ? 100 : record.content.length >= 20 ? 60 : 30;
    const tagScore = record.tags.length > 0 ? 100 : 30;
    const referenceScore = record.references.length > 0 ? 100 : 50;

    if (titleScore < 60) issues.push("Title is too short");
    if (summaryScore < 60) issues.push("Summary is missing or too short");
    if (contentScore < 60) issues.push("Content lacks sufficient detail");
    if (tagScore < 60) recommendations.push("Add tags to improve retrieval");
    if (referenceScore < 60) recommendations.push("Add references to improve traceability");

    const completenessScore = clampScore(
      (titleScore + summaryScore + contentScore + tagScore + referenceScore) / 5,
    );
    const clarityScore = clampScore((titleScore + summaryScore) / 2);
    const confidenceScore = clampScore(record.confidence);
    const overallScore = clampScore(
      (completenessScore + clarityScore + confidenceScore) / 3,
    );

    return {
      recordId: record.id,
      overallScore,
      completenessScore,
      clarityScore,
      confidenceScore,
      issues,
      recommendations,
    };
  }

  meetsMinimumQuality(record: KnowledgeRecord, threshold = 55): boolean {
    return this.evaluate(record).overallScore >= threshold;
  }
}
