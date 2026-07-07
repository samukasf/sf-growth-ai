import type {
  ExecutiveDecisionTree,
  ExecutiveRequest,
  ExecutiveRoutingEngine,
  OrchestratorRoutingContext,
  RoutingResult,
} from "../../domain";
import type { ExecutiveParticipantId } from "../../shared";

const DOMAIN_PARTICIPANTS: Record<string, ExecutiveParticipantId> = {
  memory: "memory",
  knowledge: "knowledge",
  learning: "learning",
  experience: "experience",
  wisdom: "wisdom",
};

export class DefaultExecutiveRoutingEngine implements ExecutiveRoutingEngine {
  route(
    request: ExecutiveRequest,
    decisionTree: ExecutiveDecisionTree,
    routingContext: OrchestratorRoutingContext,
  ): RoutingResult {
    const { snapshot } = routingContext;
    const participants = new Set<ExecutiveParticipantId>(
      decisionTree.matchParticipants(request.query),
    );
    const consideredFactors: string[] = ["decision_tree"];

    const intent = this.inferIntent(request.query, snapshot.priorities);
    consideredFactors.push("priorities");

    if (snapshot.memorySummary.recordCount > 0) participants.add("memory");
    if (snapshot.knowledgeSummary.recordCount > 0) participants.add("knowledge");
    if (snapshot.learningSummary.recordCount > 0) participants.add("learning");
    if (snapshot.experienceSummary.recordCount > 0) participants.add("experience");
    if (snapshot.wisdomSummary.recordCount > 0) participants.add("wisdom");
    consideredFactors.push("memory", "knowledge", "learning", "experience", "wisdom");

    if (snapshot.risks.length > 0) {
      participants.add("finance");
      participants.add("operations");
      consideredFactors.push("risks");
    }

    if (snapshot.opportunities.length > 0) {
      participants.add("innovation");
      participants.add("sales");
      participants.add("marketing");
      consideredFactors.push("opportunities");
    }

    if (snapshot.activeSignals.length > 0) {
      participants.add("executive_context");
      consideredFactors.push("active_signals");
    }

    if (snapshot.organizationSummary.recordCount > 0) {
      participants.add("company_brain");
      consideredFactors.push("organization_context");
    }

    for (const signal of snapshot.activeSignals) {
      const participant = DOMAIN_PARTICIPANTS[signal.source];
      if (participant) participants.add(participant);
    }

    return {
      participants: [...participants],
      intent,
      reason: `Brain-informed routing for intent: ${intent} (confidence: ${snapshot.confidence})`,
      brainInformed: true,
      consideredFactors: [...new Set(consideredFactors)],
    };
  }

  private inferIntent(query: string, priorities: string[]): string {
    const normalized = query.toLowerCase();
    const priorityText = priorities.join(" ").toLowerCase();

    if (normalized.includes("faturamento") || normalized.includes("receita") || priorityText.includes("revenue")) {
      return "revenue_growth";
    }
    if (normalized.includes("custo") || normalized.includes("reduzir") || priorityText.includes("risk")) {
      return "cost_reduction";
    }
    if (normalized.includes("unidade") || normalized.includes("abrir") || priorityText.includes("growth")) {
      return "expansion";
    }
    if (normalized.includes("barbearia") || normalized.includes("melhorar")) {
      return "business_improvement";
    }
    return "general";
  }
}
