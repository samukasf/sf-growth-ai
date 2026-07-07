import type { RelationshipAnalyzer, RelationshipProfile } from "../../domain";

export class DefaultRelationshipAnalyzer implements RelationshipAnalyzer {
  analyze(
    profile: RelationshipProfile,
    interactions: Array<{ type: string; date: string; summary: string }>,
  ) {
    const timeline = this.buildTimeline(profile);
    const healthScore = profile.satisfactionScore - profile.riskScore * 0.3;

    const healthLabel: "critical" | "at_risk" | "stable" | "healthy" | "excellent" =
      healthScore < 30
        ? "critical"
        : healthScore < 50
          ? "at_risk"
          : healthScore < 70
            ? "stable"
            : healthScore < 85
              ? "healthy"
              : "excellent";

    const insights: string[] = [];
    if (interactions.length === 0) insights.push("Sem interações recentes");
    if (profile.riskScore > 50) insights.push("Risco de churn detectado");
    if (profile.lifetimeValue > 0) insights.push(`LTV: ${profile.lifetimeValue}`);

    return {
      entityId: profile.entityId,
      entityType: profile.entityType,
      healthLabel,
      timeline,
      insights,
    };
  }

  buildTimeline(profile: RelationshipProfile) {
    const purchaseEvents = profile.purchaseHistory.map((p) => ({
      date: p.date,
      event: p.description,
      type: "purchase",
    }));

    const interactionEvents = profile.interactionHistory.map((i) => ({
      date: i.date,
      event: i.summary,
      type: i.type,
    }));

    return [...purchaseEvents, ...interactionEvents].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }
}
