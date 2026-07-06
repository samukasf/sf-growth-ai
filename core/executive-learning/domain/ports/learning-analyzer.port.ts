import type { LearningRecord } from "../entities";

export type LearningAnalysisReport = {
  recordId: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestedLessons: string[];
  suggestedRecommendations: string[];
};

export interface LearningAnalyzer {
  analyze(record: LearningRecord): LearningAnalysisReport;
  analyzeBatch(records: LearningRecord[]): LearningAnalysisReport[];
}
