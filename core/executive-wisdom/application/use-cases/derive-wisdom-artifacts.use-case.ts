import type { ExecutiveWisdomEngineDependencies } from "../dependencies";

export class DeriveWisdomArtifactsUseCase {
  constructor(private readonly deps: ExecutiveWisdomEngineDependencies) {}

  async execute(companyId: string) {
    const wisdomItems = await this.deps.repository.findWisdomByCompany(companyId);
    const allPatterns = wisdomItems.flatMap((wisdom) =>
      this.deps.recommendationEngine.generatePatterns(wisdom),
    );
    const prioritized = this.deps.recommendationEngine.prioritize(allPatterns);

    for (const pattern of prioritized) {
      await this.deps.repository.saveRecommendationPattern(pattern);
    }

    const evaluations = wisdomItems.map((wisdom) =>
      this.deps.decisionEvaluator.evaluate(wisdom),
    );

    return { patterns: prioritized, evaluations };
  }
}
