import type {
  Assessment,
  AssessmentAnswer,
  AssessmentBenchmark,
  AssessmentCategory,
  AssessmentDimension,
  AssessmentQuestion,
  AssessmentRecommendation,
  AssessmentRoadmap,
  AssessmentScore,
} from "../entities";
import type { AssessmentId, CompanyId } from "../../shared";
import type { AssessmentResult } from "./assessment-engine.port";

export interface AssessmentRepository {
  saveAssessment(assessment: Assessment): Promise<void>;
  findAssessmentById(assessmentId: AssessmentId): Promise<Assessment | null>;
  findAssessmentsByCompany(companyId: CompanyId): Promise<Assessment[]>;

  saveCategory(category: AssessmentCategory): Promise<void>;
  findCategoriesByAssessment(assessmentId: AssessmentId): Promise<AssessmentCategory[]>;

  saveQuestion(question: AssessmentQuestion): Promise<void>;
  findQuestionsByAssessment(assessmentId: AssessmentId): Promise<AssessmentQuestion[]>;

  saveAnswer(answer: AssessmentAnswer): Promise<void>;
  findAnswersByAssessment(assessmentId: AssessmentId): Promise<AssessmentAnswer[]>;

  saveDimension(dimension: AssessmentDimension): Promise<void>;
  findDimensionsByAssessment(assessmentId: AssessmentId): Promise<AssessmentDimension[]>;

  saveScore(score: AssessmentScore): Promise<void>;
  findScoreByAssessment(assessmentId: AssessmentId): Promise<AssessmentScore | null>;

  saveRecommendation(recommendation: AssessmentRecommendation): Promise<void>;
  findRecommendationsByAssessment(assessmentId: AssessmentId): Promise<AssessmentRecommendation[]>;

  saveRoadmap(roadmap: AssessmentRoadmap): Promise<void>;
  findRoadmapByAssessment(assessmentId: AssessmentId): Promise<AssessmentRoadmap | null>;

  saveBenchmark(benchmark: AssessmentBenchmark): Promise<void>;
  findBenchmarkByAssessment(assessmentId: AssessmentId): Promise<AssessmentBenchmark | null>;

  saveResult(assessmentId: AssessmentId, result: AssessmentResult): Promise<void>;
  findResultByAssessment(assessmentId: AssessmentId): Promise<AssessmentResult | null>;
}
