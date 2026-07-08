import { BusinessOpportunity } from "../../domain";
import type {
  DetectOpportunitiesContext,
  DetectOpportunitiesOutput,
  OpportunityDetector,
} from "../../domain";
import type { OpportunityCategoryKey, OpportunityType } from "../../shared";

type OpportunityTemplate = {
  type: OpportunityType;
  category: OpportunityCategoryKey;
  title: string;
  description: string;
  departments: string[];
  baseROI: number;
  baseCost: number;
  baseTime: number;
  triggerScore?: string;
  triggerThreshold?: number;
};

const OPPORTUNITY_TEMPLATES: OpportunityTemplate[] = [
  {
    type: "automate_process",
    category: "automation",
    title: "Automatizar processos manuais repetitivos",
    description: "Identificar e automatizar tarefas manuais de alto volume para reduzir custos operacionais.",
    departments: ["operations", "technology"],
    baseROI: 180,
    baseCost: 25000,
    baseTime: 12,
    triggerScore: "automationScore",
    triggerThreshold: 50,
  },
  {
    type: "create_software",
    category: "software_opportunity",
    title: "Desenvolver software interno sob medida",
    description: "Criar solução de software personalizada para necessidades operacionais não atendidas.",
    departments: ["technology", "operations"],
    baseROI: 220,
    baseCost: 80000,
    baseTime: 24,
    triggerScore: "digitalMaturityScore",
    triggerThreshold: 40,
  },
  {
    type: "reduce_costs",
    category: "cost_reduction",
    title: "Reduzir custos operacionais",
    description: "Otimizar despesas recorrentes e eliminar desperdícios identificados na operação.",
    departments: ["finance", "operations"],
    baseROI: 150,
    baseCost: 10000,
    baseTime: 8,
    triggerScore: "operationalEfficiencyScore",
    triggerThreshold: 55,
  },
  {
    type: "create_campaign",
    category: "marketing",
    title: "Lançar campanha de aquisição digital",
    description: "Criar campanha multicanal para aumentar leads qualificados e conversões.",
    departments: ["marketing", "sales"],
    baseROI: 200,
    baseCost: 15000,
    baseTime: 6,
    triggerScore: "customerExperienceScore",
    triggerThreshold: 45,
  },
  {
    type: "new_sales_channel",
    category: "sales",
    title: "Abrir novo canal de vendas",
    description: "Expandir presença comercial através de canal digital ou parceria estratégica.",
    departments: ["sales", "marketing"],
    baseROI: 250,
    baseCost: 30000,
    baseTime: 16,
    triggerScore: "businessHealthScore",
    triggerThreshold: 50,
  },
  {
    type: "new_dashboard",
    category: "technology",
    title: "Implementar dashboard executivo",
    description: "Centralizar KPIs críticos em painel de decisão em tempo real.",
    departments: ["technology", "finance"],
    baseROI: 120,
    baseCost: 20000,
    baseTime: 10,
    triggerScore: "enterpriseMaturityScore",
    triggerThreshold: 35,
  },
  {
    type: "switch_supplier",
    category: "operations",
    title: "Trocar fornecedor estratégico",
    description: "Renegociar ou substituir fornecedor para melhor custo-benefício.",
    departments: ["operations", "finance"],
    baseROI: 130,
    baseCost: 5000,
    baseTime: 4,
  },
  {
    type: "new_integration",
    category: "digital_transformation",
    title: "Integrar sistemas legados",
    description: "Conectar plataformas isoladas para fluxo de dados unificado.",
    departments: ["technology"],
    baseROI: 160,
    baseCost: 35000,
    baseTime: 14,
    triggerScore: "digitalMaturityScore",
    triggerThreshold: 30,
  },
];

export class DefaultOpportunityDetector implements OpportunityDetector {
  detect(context: DetectOpportunitiesContext): DetectOpportunitiesOutput {
    const scores = context.assessmentScores ?? {};
    const signals = context.signals ?? [];
    const opportunities: BusinessOpportunity[] = [];

    for (const template of OPPORTUNITY_TEMPLATES) {
      const shouldDetect =
        !template.triggerScore ||
        !template.triggerThreshold ||
        (scores[template.triggerScore] ?? 100) < template.triggerThreshold;

      if (!shouldDetect) continue;

      const confidence = this.calculateConfidence(template, scores);
      const opportunity = BusinessOpportunity.create({
        organizationId: context.organizationId,
        companyId: context.companyId,
        title: template.title,
        description: template.description,
        opportunityType: template.type,
        category: template.category,
        estimatedROI: template.baseROI,
        estimatedCost: template.baseCost,
        estimatedTime: template.baseTime,
        priority: "medium",
        confidence,
        businessImpact: Math.min(100, confidence + 10),
        riskLevel: "medium",
        requiredDepartments: template.departments,
        dependencies: [],
        recommendedActions: [],
      });
      opportunities.push(opportunity);

      signals.push({
        type: template.type,
        category: template.category,
        title: template.title,
        description: template.description,
        confidence,
        source: "rule-based-detector",
        dataPoints: [
          `category:${template.category}`,
          `type:${template.type}`,
          template.triggerScore
            ? `${template.triggerScore}:${scores[template.triggerScore] ?? "n/a"}`
            : "baseline-detection",
        ],
      });
    }

    return { opportunities, signals };
  }

  private calculateConfidence(
    template: OpportunityTemplate,
    scores: Record<string, number>,
  ): number {
    let confidence = 60;
    if (template.triggerScore && template.triggerThreshold) {
      const score = scores[template.triggerScore] ?? 50;
      const gap = template.triggerThreshold - score;
      confidence = Math.min(95, 55 + gap * 1.5);
    }
    return Math.max(40, Math.round(confidence));
  }
}
