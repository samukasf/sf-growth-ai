import {
  createAssessmentCompletedEvent,
  createRecommendationsGeneratedEvent,
  createRoadmapCreatedEvent,
  createScoreCalculatedEvent,
  AssessmentDimension,
  type AssessmentResult,
  type RunAssessmentInput,
} from "../../domain";
import {
  ASSESSMENT_DIMENSIONS,
  AssessmentNotFoundError,
  clampScore,
  getBaselineScoreForDimension,
} from "../../shared";
import type { EnterpriseAssessmentDependencies } from "../dependencies";

export class RunAssessmentUseCase {
  constructor(private readonly deps: EnterpriseAssessmentDependencies) {}

  async execute(input: RunAssessmentInput): Promise<AssessmentResult> {
    const assessment = await this.deps.repository.findAssessmentById(input.assessmentId);
    if (!assessment) throw new AssessmentNotFoundError(input.assessmentId);

    let current = assessment.withStatus("scoring");
    await this.deps.repository.saveAssessment(current);

    const questions = await this.deps.repository.findQuestionsByAssessment(input.assessmentId);

    if (input.answers) {
      for (const answer of input.answers) {
        await this.deps.repository.saveAnswer(answer);
      }
    }

    const allAnswers =
      input.answers ?? (await this.deps.repository.findAnswersByAssessment(input.assessmentId));

    const dimensions = this.buildDimensionsFromAnswers(
      input.assessmentId,
      questions,
      allAnswers,
      input.context,
    );

    for (const dimension of dimensions) {
      await this.deps.repository.saveDimension(dimension);
    }

    const { dimensions: scoredDimensions, composite, assessmentScore: score } =
      this.deps.scoreCalculator.calculate({
        assessmentId: input.assessmentId,
        dimensions,
        answers: allAnswers,
      });

    await this.deps.repository.saveScore(score);
    await this.deps.eventDispatcher.publish(
      createScoreCalculatedEvent(score, current.organizationId, current.companyId),
    );

    current = current.withScores(composite).withStatus("recommending");
    await this.deps.repository.saveAssessment(current);

    const benchmark = this.deps.benchmarkEngine.benchmark({
      assessmentId: input.assessmentId,
      industry: input.industry ?? String(input.context?.industry ?? "default"),
      dimensions: scoredDimensions,
    });
    await this.deps.repository.saveBenchmark(benchmark);

    const recommendations = this.deps.recommendationEngine.generate({
      assessmentId: input.assessmentId,
      dimensions: scoredDimensions,
      composite,
    });

    const prioritized = this.deps.priorityAnalyzer.analyze({ recommendations });
    const orderedRecommendations = prioritized.map((p) => p.recommendation);

    for (const recommendation of orderedRecommendations) {
      await this.deps.repository.saveRecommendation(recommendation);
    }

    await this.deps.eventDispatcher.publish(
      createRecommendationsGeneratedEvent(
        input.assessmentId,
        orderedRecommendations,
        current.organizationId,
        current.companyId,
      ),
    );

    current = current.withStatus("roadmapping");
    await this.deps.repository.saveAssessment(current);

    const roadmap = this.deps.roadmapGenerator.generate({
      assessmentId: input.assessmentId,
      companyName: current.companyName,
      composite,
      recommendations: orderedRecommendations,
    });
    await this.deps.repository.saveRoadmap(roadmap);
    await this.deps.eventDispatcher.publish(
      createRoadmapCreatedEvent(roadmap, current.organizationId, current.companyId),
    );

    current = current.withStatus("completed");
    await this.deps.repository.saveAssessment(current);
    await this.deps.eventDispatcher.publish(createAssessmentCompletedEvent(current));

    const result: AssessmentResult = {
      assessment: current.toJSON(),
      dimensions: scoredDimensions.map((d) => d.toJSON()),
      score: score.toJSON(),
      benchmark: benchmark.toJSON(),
      recommendations: orderedRecommendations.map((r) => r.toJSON()),
      roadmap: roadmap.toJSON(),
      summary: [
        `Avaliação de maturidade concluída para ${current.companyName}.`,
        `Enterprise Maturity Score: ${composite.enterpriseMaturityScore}/100.`,
        `AI Readiness: ${composite.aiReadinessScore}/100.`,
        `${orderedRecommendations.length} recomendações · Roadmap 30/90/180/365 dias.`,
      ].join(" "),
    };

    await this.deps.repository.saveResult(input.assessmentId, result);
    await this.syncIntegrations(current, result);

    return result;
  }

  private buildDimensionsFromAnswers(
    assessmentId: string,
    questions: import("../../domain").AssessmentQuestion[],
    answers: import("../../domain").AssessmentAnswer[],
    context?: Record<string, unknown>,
  ): AssessmentDimension[] {
    const answersByQuestion = new Map(answers.map((a) => [a.questionId, a.normalizedScore]));

    return ASSESSMENT_DIMENSIONS.map((def) => {
      const dimQuestions = questions.filter((q) => q.dimensionKey === def.key);
      const dimAnswers = dimQuestions
        .map((q) => answersByQuestion.get(q.id))
        .filter((s): s is number => s !== undefined);

      let score: number;
      if (dimAnswers.length > 0) {
        score = clampScore(dimAnswers.reduce((a, b) => a + b, 0) / dimAnswers.length);
      } else if (context?.[`score_${def.key}`] !== undefined) {
        score = clampScore(Number(context[`score_${def.key}`]));
      } else {
        score = getBaselineScoreForDimension(def.key);
      }

      return AssessmentDimension.create({
        assessmentId,
        key: def.key,
        label: def.label,
        score,
        weight: def.weight,
        gapCount: score < 50 ? 2 : score < 70 ? 1 : 0,
      });
    });
  }

  private async syncIntegrations(
    assessment: import("../../domain").Assessment,
    result: AssessmentResult,
  ) {
    if (this.deps.enterpriseBrain.isAvailable()) {
      await this.deps.enterpriseBrain.syncAssessmentScores(assessment);
    }
    if (this.deps.executiveInnovation.isAvailable()) {
      await this.deps.executiveInnovation.submitRecommendations(
        assessment.organizationId,
        assessment.companyId,
        result.recommendations as unknown as Record<string, unknown>[],
      );
    }
    if (this.deps.executiveProjects.isAvailable()) {
      await this.deps.executiveProjects.createProjectsFromRoadmap(
        assessment.organizationId,
        assessment.companyId,
        result.roadmap as unknown as Record<string, unknown>,
      );
    }
    if (this.deps.softwareFactory.isAvailable()) {
      await this.deps.softwareFactory.evaluateSoftwareNeeds(
        assessment.organizationId,
        assessment.companyId,
        result.recommendations as unknown as Record<string, unknown>[],
      );
    }
    if (this.deps.executiveCeo.isAvailable()) {
      await this.deps.executiveCeo.deliverExecutiveBriefing(
        assessment.organizationId,
        assessment.companyId,
        { summary: result.summary, score: result.score },
      );
    }
  }
}
