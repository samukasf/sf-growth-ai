import { OpportunityRecommendation } from "../../domain";
import type {
  RecommendationBuildInput,
  RecommendationBuildOutput,
  RecommendationBuilder,
} from "../../domain";

const DEPARTMENT_ACTIONS: Record<string, string[]> = {
  technology: ["Avaliar stack tecnológico", "Definir arquitetura", "Estimar esforço de desenvolvimento"],
  operations: ["Mapear processos atuais", "Identificar gargalos", "Definir SLA de implementação"],
  finance: ["Validar orçamento", "Projetar fluxo de caixa", "Definir métricas de retorno"],
  marketing: ["Definir público-alvo", "Criar plano de campanha", "Estabelecer KPIs de conversão"],
  sales: ["Treinar equipa comercial", "Definir metas de vendas", "Configurar pipeline"],
};

export class DefaultRecommendationBuilder implements RecommendationBuilder {
  build(input: RecommendationBuildInput): RecommendationBuildOutput {
    const { opportunity } = input;
    const recommendations: OpportunityRecommendation[] = [];
    const recommendedActions: RecommendationBuildOutput["recommendedActions"] = [];
    let order = 1;

    for (const dept of opportunity.requiredDepartments) {
      const actions = DEPARTMENT_ACTIONS[dept] ?? [`Executar ações em ${dept}`];
      for (const action of actions.slice(0, 2)) {
        const rec = OpportunityRecommendation.create({
          opportunityId: opportunity.id,
          title: action,
          description: `${action} para suportar: ${opportunity.title}`,
          department: dept,
          order,
          expectedOutcome: `Contribuição de ${dept} para o sucesso da oportunidade`,
        });
        recommendations.push(rec);
        recommendedActions.push({
          id: `action-${order}`,
          label: action,
          department: dept,
          order,
        });
        order++;
      }
    }

    const executiveRec = OpportunityRecommendation.create({
      opportunityId: opportunity.id,
      title: "Aprovar plano executivo",
      description: "Submeter oportunidade ao conselho executivo para decisão final.",
      department: "executive",
      order,
      expectedOutcome: "Decisão executiva formalizada",
    });
    recommendations.push(executiveRec);
    recommendedActions.push({
      id: `action-${order}`,
      label: "Aprovar plano executivo",
      department: "executive",
      order,
    });

    return { recommendations, recommendedActions };
  }
}
