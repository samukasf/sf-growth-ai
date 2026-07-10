import type { OrchestratorResponse } from "../../core/orchestrator/orchestrator.types";
import type { CompanyBrainSnapshot } from "../../core/orchestrator/orchestrator.types";
import { MOCK_COMPANY_BRAIN } from "../../core/superbrain/superbrain.mocks";
import type {
  ActionPlanData,
  AnalysisItem,
  AnalysisRecommendation,
  DecisionAnalysisData,
} from "./company-analysis.types";

function item(id: string, title: string, description: string): AnalysisItem {
  return { id, title, description };
}

export function generateDecisionAnalysis(
  orchestrator: OrchestratorResponse,
  companyName: string,
): DecisionAnalysisData {
  const brain = orchestrator.runtime.companyBrain ?? {
    ...MOCK_COMPANY_BRAIN,
    companyName,
  };

  const strengths: AnalysisItem[] = [
    item("str-brand", "Marca consistente", "Identidade visual reconhecida no mercado local."),
    item(
      "str-ops",
      "Operação eficiente",
      `Capacidade operacional em ${brain.health.operations ?? 72}% — pronta para escalar.`,
    ),
    item(
      "str-fin",
      "Financeiro estável",
      `Saúde financeira em ${brain.health.financial ?? 65}% com margem preservada.`,
    ),
  ];

  const weaknesses: AnalysisItem[] = [
    item(
      "weak-seo",
      "Pouca presença em SEO",
      `Score digital em ${brain.health.digital ?? 38}% — tráfego orgânico abaixo do benchmark.`,
    ),
    item(
      "weak-sales",
      "Volume de vendas",
      `Dimensão vendas em ${brain.health.sales ?? 45}% — receita abaixo da meta.`,
    ),
    item(
      "weak-positioning",
      "Posicionamento informal",
      "Proposta de valor ainda não formalizada documentalmente.",
    ),
  ];

  const opportunities: AnalysisItem[] = [
    item(
      "opp-google",
      "Campanhas Google",
      "Sazonalidade favorável para Google Ads local nos próximos 30 dias.",
    ),
    item(
      "opp-landing",
      "Landing Pages",
      "Captura de leads via landing page dedicada ao principal serviço.",
    ),
    item(
      "opp-reactivation",
      "Reativação de base",
      `${String(brain.profile.inactiveCustomers ?? 340)} clientes inativos elegíveis para retargeting.`,
    ),
  ];

  const risks: AnalysisItem[] = [
    item(
      "risk-referral",
      "Dependência de indicação",
      "Mais de 60% dos novos clientes vêm de indicação — canal único e instável.",
    ),
    item(
      "risk-competition",
      "Concorrentes digitalizando",
      "Concorrentes locais intensificaram presença digital nos últimos 45 dias.",
    ),
    item(
      "risk-brand-gap",
      "Fragmentação de marca",
      "Comunicação inconsistente entre canais reduz taxa de conversão.",
    ),
  ];

  const recommendations: AnalysisRecommendation[] = [
    {
      id: "rec-google-ads",
      title: "Criar campanha Google Ads",
      description:
        "Ativar campanha de busca local com budget inicial de R$ 800/mês e landing page dedicada.",
      priority: "Critical",
      department: "Marketing",
    },
    {
      id: "rec-seo",
      title: "Plano de SEO técnico",
      description: "Corrigir indexação, meta tags e conteúdo para recuperar tráfego orgânico.",
      priority: "High",
      department: "Marketing Digital",
    },
    {
      id: "rec-positioning",
      title: "Workshop de posicionamento",
      description: "Formalizar proposta de valor antes de escalar investimento em mídia.",
      priority: "High",
      department: "Estratégia",
    },
  ];

  return {
    id: `decision-analysis-${Date.now()}`,
    strengths,
    weaknesses,
    opportunities,
    risks,
    recommendations,
    primaryDecision: "Criar campanha Google Ads",
    rationale: [
      `Análise de ${companyName}.`,
      `Growth Score ${brain.growthScore ?? 642}/1000.`,
      orchestrator.runtime.executiveCouncil?.summary ?? "Conselho recomenda aceleração digital.",
    ].join(" "),
    generatedAt: new Date().toISOString(),
  };
}

export function generateActionPlan(decision: DecisionAnalysisData): ActionPlanData {
  return {
    id: `action-plan-${Date.now()}`,
    decisionId: decision.id,
    priorityActions: [
      {
        id: "action-1",
        title: decision.primaryDecision,
        owner: "Sophia · CMO",
        deadline: "7 dias",
        order: 1,
      },
      {
        id: "action-2",
        title: "Criar landing page de conversão",
        owner: "Software Factory",
        deadline: "10 dias",
        order: 2,
      },
      {
        id: "action-3",
        title: "Configurar tracking de conversões",
        owner: "Business Twin · Digital",
        deadline: "14 dias",
        order: 3,
      },
      {
        id: "action-4",
        title: "Revisar resultados e otimizar campanha",
        owner: "Samuel AI",
        deadline: "30 dias",
        order: 4,
      },
    ],
    generatedAt: new Date().toISOString(),
  };
}

export function resolveCompanyBrainSnapshot(
  companyName: string,
  tenantId: string,
  companyId: string,
): CompanyBrainSnapshot {
  return {
    ...MOCK_COMPANY_BRAIN,
    tenantId,
    companyId,
    companyName,
    generatedAt: new Date().toISOString(),
  };
}
