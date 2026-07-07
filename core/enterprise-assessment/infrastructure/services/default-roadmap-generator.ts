import {
  AssessmentRoadmap,
  type GenerateRoadmapInput,
  type RoadmapGenerator,
  type RoadmapItem,
} from "../../domain";
import type { RoadmapHorizon } from "../../shared";

const HORIZON_LABELS: Record<RoadmapHorizon, string> = {
  "30_days": "30 dias — Visibilidade",
  "90_days": "90 dias — Inteligência",
  "180_days": "180 dias — Execução",
  "365_days": "365 dias — Escala",
};

const HORIZON_FOCUS: Record<RoadmapHorizon, string> = {
  "30_days": "Ativar Supercérebro, briefing diário e automações quick-win",
  "90_days": "Integrações, pipeline comercial e Conselho Executivo ativo",
  "180_days": "Projetos estratégicos, portal do cliente e ROI mensurável",
  "365_days": "Business Twin™ vivo, expansão e modelo replicável",
};

export class DefaultRoadmapGenerator implements RoadmapGenerator {
  generate(input: GenerateRoadmapInput): AssessmentRoadmap {
    const horizons: RoadmapHorizon[] = ["30_days", "90_days", "180_days", "365_days"];

    const phases = horizons.map((horizon) => {
      const items: RoadmapItem[] = input.recommendations
        .filter((r) => r.horizon === horizon)
        .slice(0, 5)
        .map((r, index) => ({
          id: `rmap-${horizon}-${index}`,
          title: r.title,
          description: r.description,
          dimensionKey: r.dimensionKey,
          priority: r.priority,
        }));

      if (items.length === 0 && horizon === "30_days") {
        items.push({
          id: "rmap-default-30",
          title: "Ativar briefing diário do Supercérebro",
          description: "Primeiro ritual executivo com Samuel AI.",
          dimensionKey: "estrategia",
          priority: "high",
        });
      }

      const targetScore = this.targetScoreForHorizon(horizon, input.composite.enterpriseMaturityScore);

      return {
        horizon,
        label: HORIZON_LABELS[horizon],
        focus: HORIZON_FOCUS[horizon],
        items,
        targetScore,
      };
    });

    const executiveSummary = [
      `Roadmap estratégico para ${input.companyName}.`,
      `Enterprise Maturity Score atual: ${input.composite.enterpriseMaturityScore}/100.`,
      `AI Readiness: ${input.composite.aiReadinessScore}/100.`,
      `${input.recommendations.length} recomendações priorizadas em 4 horizontes.`,
    ].join(" ");

    return AssessmentRoadmap.create({
      assessmentId: input.assessmentId,
      phases,
      executiveSummary,
    });
  }

  private targetScoreForHorizon(horizon: RoadmapHorizon, current: number): number {
    const boosts: Record<RoadmapHorizon, number> = {
      "30_days": 8,
      "90_days": 18,
      "180_days": 28,
      "365_days": 38,
    };
    return Math.min(100, current + boosts[horizon]);
  }
}
