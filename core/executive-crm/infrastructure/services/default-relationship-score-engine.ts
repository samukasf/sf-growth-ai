import type { RelationshipProfile, RelationshipScoreEngine } from "../../domain";
import type { RelationshipScores } from "../../shared";

export class DefaultRelationshipScoreEngine implements RelationshipScoreEngine {
  compute(profile: RelationshipProfile): RelationshipScores {
    const purchaseBoost = Math.min(profile.purchaseHistory.length * 5, 20);
    const interactionBoost = Math.min(profile.interactionHistory.length * 3, 15);

    const satisfaction = Math.min(
      100,
      profile.satisfactionScore + interactionBoost,
    );
    const relationship = Math.min(
      100,
      profile.relationshipScore + purchaseBoost,
    );
    const risk = Math.max(0, profile.riskScore - Math.floor(interactionBoost / 2));
    const lifetimeValue = profile.purchaseHistory.reduce((sum, p) => sum + p.amount, 0);

    return { satisfaction, relationship, risk, lifetimeValue };
  }

  computeHealthScore(satisfaction: number, risk: number): number {
    return Math.max(0, Math.min(100, satisfaction - risk * 0.5));
  }
}
