import type { RecommendationEngine, RelationshipProfile } from "../../domain";
import type { NextBestAction } from "../../domain";

export class DefaultRecommendationEngine implements RecommendationEngine {
  recommend(profile: RelationshipProfile): NextBestAction[] {
    const actions: NextBestAction[] = [];

    if (profile.interactionHistory.length === 0) {
      actions.push({
        id: "nba-1",
        type: "outreach",
        title: "Primeiro contato",
        priority: "high",
        reason: "Nenhuma interação registrada",
        confidence: 0.85,
      });
    }

    if (profile.riskScore > 60) {
      actions.push({
        id: "nba-2",
        type: "retention",
        title: "Ação de retenção",
        priority: "high",
        reason: "Score de risco elevado",
        confidence: 0.9,
      });
    }

    if (profile.satisfactionScore < 50) {
      actions.push({
        id: "nba-3",
        type: "support",
        title: "Follow-up de satisfação",
        priority: "medium",
        reason: "Satisfação abaixo do esperado",
        confidence: 0.75,
      });
    }

    if (actions.length === 0) {
      actions.push({
        id: "nba-default",
        type: "nurture",
        title: "Manter relacionamento",
        priority: "low",
        reason: "Relacionamento estável",
        confidence: 0.6,
      });
    }

    return actions;
  }

  nextBestAction(profile: RelationshipProfile): NextBestAction | null {
    const actions = this.recommend(profile);
    return actions.sort((a, b) => b.confidence - a.confidence)[0] ?? null;
  }
}
