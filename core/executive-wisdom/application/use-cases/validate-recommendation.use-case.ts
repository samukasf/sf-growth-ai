import { createRecommendationValidatedEvent } from "../../domain";
import type { ValidateRecommendationDto } from "../dto";
import type { ExecutiveWisdomEngineDependencies } from "../dependencies";

export class ValidateRecommendationUseCase {
  constructor(private readonly deps: ExecutiveWisdomEngineDependencies) {}

  async execute(dto: ValidateRecommendationDto) {
    const patterns = await this.deps.repository.findRecommendationPatterns(dto.companyId);
    const pattern = patterns.find((item) => item.id === dto.patternId);

    if (!pattern) {
      throw new Error(`Recommendation pattern not found: ${dto.patternId}`);
    }

    const validated = pattern.markValidated();
    await this.deps.repository.saveRecommendationPattern(validated);

    const event = createRecommendationValidatedEvent(validated);
    await this.deps.eventDispatcher.publish(event);

    const wisdom = await this.deps.repository.findWisdomById(validated.wisdomId);
    if (wisdom) {
      await this.deps.executiveMemory.syncWisdom({
        companyId: wisdom.companyId,
        wisdom: wisdom.toJSON(),
        syncReason: "validated",
      });

      const highlights = await this.deps.executiveCeo.summarizeWisdomImpact([wisdom]);
      await this.deps.executiveCeo.notifyWisdomInsight({
        companyId: wisdom.companyId,
        headline: "Recommendation validated",
        recommendations: highlights,
        wisdomId: wisdom.id,
      });
    }

    return validated;
  }
}
