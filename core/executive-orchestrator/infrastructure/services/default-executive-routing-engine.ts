import type { ExecutiveDecisionTree, ExecutiveRequest, ExecutiveRoutingEngine, RoutingResult } from "../../domain";

export class DefaultExecutiveRoutingEngine implements ExecutiveRoutingEngine {
  route(request: ExecutiveRequest, decisionTree: ExecutiveDecisionTree): RoutingResult {
    const participants = decisionTree.matchParticipants(request.query);
    const intent = this.inferIntent(request.query);

    return {
      participants,
      intent,
      reason: `Roteamento automático para intent: ${intent}`,
    };
  }

  private inferIntent(query: string): string {
    const normalized = query.toLowerCase();
    if (normalized.includes("faturamento") || normalized.includes("receita")) {
      return "revenue_growth";
    }
    if (normalized.includes("custo") || normalized.includes("reduzir")) {
      return "cost_reduction";
    }
    if (normalized.includes("unidade") || normalized.includes("abrir")) {
      return "expansion";
    }
    if (normalized.includes("barbearia") || normalized.includes("melhorar")) {
      return "business_improvement";
    }
    return "general";
  }
}
