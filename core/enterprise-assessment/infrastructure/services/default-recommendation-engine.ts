import {
  AssessmentRecommendation,
  type GenerateRecommendationsInput,
  type RecommendationEngine,
} from "../../domain";
import type { AssessmentDimensionKey } from "../../shared";

type RecTemplate = {
  dimensionKey: AssessmentDimensionKey;
  title: string;
  description: string;
  threshold: number;
  priority: "low" | "medium" | "high" | "critical";
  effort: "low" | "medium" | "high";
  horizon: "30_days" | "90_days" | "180_days" | "365_days";
  impact: string;
  roi?: string;
};

const TEMPLATES: RecTemplate[] = [
  {
    dimensionKey: "estrategia",
    title: "Instituir rituais executivos com Supercérebro",
    description: "Ativar briefing diário e review semanal com Samuel AI.",
    threshold: 60,
    priority: "high",
    effort: "low",
    horizon: "30_days",
    impact: "CEO liberta 16h/semana",
    roi: "500%",
  },
  {
    dimensionKey: "dados",
    title: "Unificar fontes de dados no Business Twin™",
    description: "Integrar ERP, CRM e planilhas num snapshot único.",
    threshold: 55,
    priority: "critical",
    effort: "medium",
    horizon: "90_days",
    impact: "Decisões em tempo real",
    roi: "700%",
  },
  {
    dimensionKey: "automacao",
    title: "Implementar 4 automações quick-win",
    description: "Alertas de lead, follow-up, faturação e cobrança.",
    threshold: 50,
    priority: "high",
    effort: "low",
    horizon: "30_days",
    impact: "36h/semana libertadas",
    roi: "600%",
  },
  {
    dimensionKey: "tecnologia",
    title: "Integrar ERP com Enterprise Brain",
    description: "Sincronizar faturação, stocks e compras.",
    threshold: 50,
    priority: "high",
    effort: "medium",
    horizon: "90_days",
    impact: "Eliminar reentrada de dados",
    roi: "450%",
  },
  {
    dimensionKey: "vendas",
    title: "Estruturar pipeline comercial",
    description: "CRM integrado ao Supercérebro com scoring de leads.",
    threshold: 55,
    priority: "high",
    effort: "medium",
    horizon: "90_days",
    impact: "+10 pp conversão",
    roi: "800%",
  },
  {
    dimensionKey: "financeiro",
    title: "Margem por projeto em tempo real",
    description: "CFO digital valida margem antes de aprovar orçamentos.",
    threshold: 55,
    priority: "high",
    effort: "medium",
    horizon: "90_days",
    impact: "+4 pp margem bruta",
    roi: "900%",
  },
  {
    dimensionKey: "experiencia_cliente",
    title: "Portal do cliente com tracking",
    description: "Self-service para acompanhamento e aprovação de provas.",
    threshold: 50,
    priority: "medium",
    effort: "high",
    horizon: "180_days",
    impact: "NPS +12 pontos",
    roi: "400%",
  },
  {
    dimensionKey: "inteligencia_artificial",
    title: "Ativar Conselho Executivo Digital",
    description: "Convocar CFO, CMO, COO, CRO para deliberações reais.",
    threshold: 45,
    priority: "critical",
    effort: "low",
    horizon: "30_days",
    impact: "Decisões multi-domínio",
    roi: "1.000%",
  },
  {
    dimensionKey: "marketing",
    title: "Medir CAC e ROI por canal",
    description: "Implementar tracking e otimização de aquisição.",
    threshold: 50,
    priority: "medium",
    effort: "medium",
    horizon: "90_days",
    impact: "CAC -25%",
    roi: "550%",
  },
  {
    dimensionKey: "operacoes",
    title: "Documentar processos críticos",
    description: "Mapear Order-to-Cash no Executive Knowledge.",
    threshold: 55,
    priority: "medium",
    effort: "medium",
    horizon: "90_days",
    impact: "OTD +12 pp",
    roi: "480%",
  },
];

export class DefaultRecommendationEngine implements RecommendationEngine {
  generate(input: GenerateRecommendationsInput): AssessmentRecommendation[] {
    const recommendations: AssessmentRecommendation[] = [];
    const dimByKey = Object.fromEntries(input.dimensions.map((d) => [d.key, d]));

    for (const template of TEMPLATES) {
      const dim = dimByKey[template.dimensionKey];
      if (!dim || dim.score >= template.threshold) continue;

      recommendations.push(
        AssessmentRecommendation.create({
          assessmentId: input.assessmentId,
          dimensionKey: template.dimensionKey,
          title: template.title,
          description: template.description,
          priority: template.priority,
          estimatedImpact: template.impact,
          estimatedRoi: template.roi,
          effort: template.effort,
          horizon: template.horizon,
        }),
      );
    }

    if (input.composite.aiReadinessScore < 50) {
      recommendations.push(
        AssessmentRecommendation.create({
          assessmentId: input.assessmentId,
          dimensionKey: "inteligencia_artificial",
          title: "Completar descoberta empresarial (EDP)",
          description: "Executar Enterprise Discovery Protocol para elevar AI Readiness.",
          priority: "critical",
          estimatedImpact: "AI Readiness +20 pp",
          estimatedRoi: "650%",
          effort: "medium",
          horizon: "90_days",
        }),
      );
    }

    return recommendations;
  }
}
