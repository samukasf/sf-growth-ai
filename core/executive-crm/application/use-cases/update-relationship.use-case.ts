import { createRelationshipUpdatedEvent } from "../../domain";
import type { UpdateRelationshipDto } from "../dto";
import type { ExecutiveCrmDependencies } from "../dependencies";

export class UpdateRelationshipUseCase {
  constructor(private readonly deps: ExecutiveCrmDependencies) {}

  async execute(dto: UpdateRelationshipDto) {
    const profile = await this.deps.crmRepository.findRelationshipProfile(dto.entityId);
    if (!profile) throw new Error(`Relationship profile not found: ${dto.entityId}`);

    const interactions = await this.deps.crmRepository.findInteractionsByEntity(dto.entityId);
    const analysis = this.deps.relationshipAnalyzer.analyze(
      profile,
      interactions.map((i) => ({
        type: i.type,
        date: i.occurredAt,
        summary: i.summary,
      })),
    );

    const scores = this.deps.relationshipScoreEngine.compute(profile);
    const recommendations = this.deps.recommendationEngine.recommend(profile);

    const updated = profile.updateScores({
      satisfactionScore: scores.satisfaction,
      relationshipScore: scores.relationship,
      riskScore: scores.risk,
      lifetimeValue: scores.lifetimeValue,
      recommendedActions: recommendations,
    });

    await this.deps.crmRepository.saveRelationshipProfile(updated);
    await this.deps.eventDispatcher.publish(createRelationshipUpdatedEvent(updated));

    return { profile: updated, analysis, scores };
  }
}
