import {
  AssessmentDimension,
  AssessmentScore,
  type CalculateScoresInput,
  type CalculateScoresResult,
  type ScoreCalculator,
} from "../../domain";
import { ASSESSMENT_DIMENSIONS, clampScore, weightedAverage } from "../../shared";
import { getBaselineScoreForDimension } from "../../shared";

export class DefaultScoreCalculator implements ScoreCalculator {
  calculate(input: CalculateScoresInput): CalculateScoresResult {
    const dimensions =
      input.dimensions.length > 0
        ? input.dimensions
        : this.buildBaselineDimensions(input.assessmentId, input.answers);

    const composite = this.buildCompositeScores(dimensions);
    const assessmentScore = this.buildAssessmentScore(input.assessmentId, composite);
    return { dimensions, composite, assessmentScore };
  }

  buildAssessmentScore(
    assessmentId: string,
    composite: ReturnType<DefaultScoreCalculator["buildCompositeScores"]>,
  ): AssessmentScore {
    return AssessmentScore.create({
      assessmentId,
      entries: [
        { key: "enterprise_maturity", label: "Enterprise Maturity Score", score: composite.enterpriseMaturityScore, weight: 1.5 },
        { key: "business_health", label: "Business Health Score", score: composite.businessHealthScore, weight: 1.3 },
        { key: "automation", label: "Automation Score", score: composite.automationScore, weight: 1 },
        { key: "digital_maturity", label: "Digital Maturity Score", score: composite.digitalMaturityScore, weight: 1.1 },
        { key: "ai_readiness", label: "AI Readiness Score", score: composite.aiReadinessScore, weight: 1.2 },
        { key: "operational_efficiency", label: "Operational Efficiency Score", score: composite.operationalEfficiencyScore, weight: 1.1 },
        { key: "customer_experience", label: "Customer Experience Score", score: composite.customerExperienceScore, weight: 1 },
      ],
      overallScore: composite.enterpriseMaturityScore,
    });
  }

  private buildBaselineDimensions(
    assessmentId: string,
    answers: CalculateScoresInput["answers"],
  ): AssessmentDimension[] {
    const scoresByDimension = new Map<string, number[]>();
    for (const answer of answers) {
      const list = scoresByDimension.get(answer.questionId) ?? [];
      list.push(answer.normalizedScore);
      scoresByDimension.set(answer.questionId, list);
    }

    return ASSESSMENT_DIMENSIONS.map((def) => {
      const answerScores = [...scoresByDimension.values()].flat();
      const score =
        answerScores.length > 0
          ? clampScore(answerScores.reduce((a, b) => a + b, 0) / answerScores.length)
          : getBaselineScoreForDimension(def.key);

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

  private buildCompositeScores(dimensions: AssessmentDimension[]) {
    const byKey = Object.fromEntries(dimensions.map((d) => [d.key, d.score])) as Record<string, number>;

    return {
      enterpriseMaturityScore: clampScore(
        weightedAverage(dimensions.map((d) => ({ score: d.score, weight: d.weight }))),
      ),
      businessHealthScore: clampScore(
        weightedAverage([
          { score: byKey.financeiro ?? 0, weight: 1.3 },
          { score: byKey.operacoes ?? 0, weight: 1.1 },
          { score: byKey.vendas ?? 0, weight: 1 },
        ]),
      ),
      automationScore: clampScore(byKey.automacao ?? 0),
      digitalMaturityScore: clampScore(
        weightedAverage([
          { score: byKey.tecnologia ?? 0, weight: 1.2 },
          { score: byKey.marketing ?? 0, weight: 1 },
          { score: byKey.dados ?? 0, weight: 1.1 },
        ]),
      ),
      aiReadinessScore: clampScore(
        weightedAverage([
          { score: byKey.inteligencia_artificial ?? 0, weight: 1.3 },
          { score: byKey.dados ?? 0, weight: 1.2 },
          { score: byKey.automacao ?? 0, weight: 1 },
        ]),
      ),
      operationalEfficiencyScore: clampScore(
        weightedAverage([
          { score: byKey.operacoes ?? 0, weight: 1.3 },
          { score: byKey.automacao ?? 0, weight: 1 },
          { score: byKey.rh ?? 0, weight: 0.8 },
        ]),
      ),
      customerExperienceScore: clampScore(
        weightedAverage([
          { score: byKey.experiencia_cliente ?? 0, weight: 1.3 },
          { score: byKey.vendas ?? 0, weight: 1 },
          { score: byKey.comunicacao ?? 0, weight: 0.9 },
        ]),
      ),
    };
  }
}
