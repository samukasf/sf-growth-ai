import {
  Assessment,
  AssessmentAnswer,
  AssessmentBenchmark,
  AssessmentCategory,
  AssessmentDimension,
  AssessmentQuestion,
  AssessmentRecommendation,
  AssessmentRoadmap,
  AssessmentScore,
  type AssessmentRepository,
  type AssessmentResult,
} from "../../domain";
import type { AssessmentId, CompanyId } from "../../shared";

function serialize<T>(value: T): string {
  return JSON.stringify(value);
}

export class InMemoryAssessmentRepository implements AssessmentRepository {
  private readonly assessments = new Map<string, string>();
  private readonly categories = new Map<string, string[]>();
  private readonly questions = new Map<string, string[]>();
  private readonly answers = new Map<string, string[]>();
  private readonly dimensions = new Map<string, string[]>();
  private readonly scores = new Map<string, string>();
  private readonly recommendations = new Map<string, string[]>();
  private readonly roadmaps = new Map<string, string>();
  private readonly benchmarks = new Map<string, string>();
  private readonly results = new Map<string, string>();

  async saveAssessment(assessment: Assessment): Promise<void> {
    this.assessments.set(assessment.id, serialize(assessment.toJSON()));
  }

  async findAssessmentById(assessmentId: AssessmentId): Promise<Assessment | null> {
    const raw = this.assessments.get(assessmentId);
    return raw ? Assessment.create(JSON.parse(raw)) : null;
  }

  async findAssessmentsByCompany(companyId: CompanyId): Promise<Assessment[]> {
    return [...this.assessments.values()]
      .map((raw) => Assessment.create(JSON.parse(raw)))
      .filter((a) => a.companyId === companyId);
  }

  async saveCategory(category: AssessmentCategory): Promise<void> {
    const list = this.categories.get(category.assessmentId) ?? [];
    list.push(serialize(category.toJSON()));
    this.categories.set(category.assessmentId, list);
  }

  async findCategoriesByAssessment(assessmentId: AssessmentId): Promise<AssessmentCategory[]> {
    return (this.categories.get(assessmentId) ?? []).map((raw) =>
      AssessmentCategory.create(JSON.parse(raw)),
    );
  }

  async saveQuestion(question: AssessmentQuestion): Promise<void> {
    const list = this.questions.get(question.assessmentId) ?? [];
    list.push(serialize(question.toJSON()));
    this.questions.set(question.assessmentId, list);
  }

  async findQuestionsByAssessment(assessmentId: AssessmentId): Promise<AssessmentQuestion[]> {
    return (this.questions.get(assessmentId) ?? []).map((raw) =>
      AssessmentQuestion.create(JSON.parse(raw)),
    );
  }

  async saveAnswer(answer: AssessmentAnswer): Promise<void> {
    const list = this.answers.get(answer.assessmentId) ?? [];
    list.push(serialize(answer.toJSON()));
    this.answers.set(answer.assessmentId, list);
  }

  async findAnswersByAssessment(assessmentId: AssessmentId): Promise<AssessmentAnswer[]> {
    return (this.answers.get(assessmentId) ?? []).map((raw) =>
      AssessmentAnswer.create(JSON.parse(raw)),
    );
  }

  async saveDimension(dimension: AssessmentDimension): Promise<void> {
    const list = this.dimensions.get(dimension.assessmentId) ?? [];
    list.push(serialize(dimension.toJSON()));
    this.dimensions.set(dimension.assessmentId, list);
  }

  async findDimensionsByAssessment(assessmentId: AssessmentId): Promise<AssessmentDimension[]> {
    return (this.dimensions.get(assessmentId) ?? []).map((raw) =>
      AssessmentDimension.create(JSON.parse(raw)),
    );
  }

  async saveScore(score: AssessmentScore): Promise<void> {
    this.scores.set(score.assessmentId, serialize(score.toJSON()));
  }

  async findScoreByAssessment(assessmentId: AssessmentId): Promise<AssessmentScore | null> {
    const raw = this.scores.get(assessmentId);
    return raw ? AssessmentScore.create(JSON.parse(raw)) : null;
  }

  async saveRecommendation(recommendation: AssessmentRecommendation): Promise<void> {
    const list = this.recommendations.get(recommendation.assessmentId) ?? [];
    list.push(serialize(recommendation.toJSON()));
    this.recommendations.set(recommendation.assessmentId, list);
  }

  async findRecommendationsByAssessment(
    assessmentId: AssessmentId,
  ): Promise<AssessmentRecommendation[]> {
    return (this.recommendations.get(assessmentId) ?? []).map((raw) =>
      AssessmentRecommendation.create(JSON.parse(raw)),
    );
  }

  async saveRoadmap(roadmap: AssessmentRoadmap): Promise<void> {
    this.roadmaps.set(roadmap.assessmentId, serialize(roadmap.toJSON()));
  }

  async findRoadmapByAssessment(assessmentId: AssessmentId): Promise<AssessmentRoadmap | null> {
    const raw = this.roadmaps.get(assessmentId);
    return raw ? AssessmentRoadmap.create(JSON.parse(raw)) : null;
  }

  async saveBenchmark(benchmark: AssessmentBenchmark): Promise<void> {
    this.benchmarks.set(benchmark.assessmentId, serialize(benchmark.toJSON()));
  }

  async findBenchmarkByAssessment(assessmentId: AssessmentId): Promise<AssessmentBenchmark | null> {
    const raw = this.benchmarks.get(assessmentId);
    return raw ? AssessmentBenchmark.create(JSON.parse(raw)) : null;
  }

  async saveResult(assessmentId: AssessmentId, result: AssessmentResult): Promise<void> {
    this.results.set(assessmentId, serialize(result));
  }

  async findResultByAssessment(assessmentId: AssessmentId): Promise<AssessmentResult | null> {
    const raw = this.results.get(assessmentId);
    return raw ? (JSON.parse(raw) as AssessmentResult) : null;
  }
}
