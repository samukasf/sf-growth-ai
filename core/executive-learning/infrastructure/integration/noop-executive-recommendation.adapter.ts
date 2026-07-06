import type {
  ExecutiveRecommendationCandidate,
  ExecutiveRecommendationPort,
} from "../../application";
import type { LearningRecord } from "../../domain";

export class NoopExecutiveRecommendationAdapter implements ExecutiveRecommendationPort {
  async proposeFromLearning(record: LearningRecord): Promise<ExecutiveRecommendationCandidate[]> {
    return record.recommendations.map((recommendation, index) => ({
      companyId: record.companyId,
      title: `Learning recommendation ${index + 1}`,
      description: recommendation,
      priority: record.impact >= 70 ? "high" : "medium",
      sourceRecordId: record.id,
    }));
  }

  async registerRecommendations(candidates: ExecutiveRecommendationCandidate[]): Promise<void> {
    void candidates;
  }
}
