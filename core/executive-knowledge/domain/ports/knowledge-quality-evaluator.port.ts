import type { KnowledgeRecord } from "../entities";
import type { Score } from "../../shared";

export type KnowledgeQualityReport = {
  recordId: string;
  overallScore: Score;
  completenessScore: Score;
  clarityScore: Score;
  confidenceScore: Score;
  issues: string[];
  recommendations: string[];
};

export interface KnowledgeQualityEvaluator {
  evaluate(record: KnowledgeRecord): KnowledgeQualityReport;
  meetsMinimumQuality(record: KnowledgeRecord, threshold?: Score): boolean;
}
