import { ExecutiveDecisionTree } from "../../domain";
import type { ExecutiveParticipantId } from "../../shared";

export function createDefaultDecisionTree(companyId: string): ExecutiveDecisionTree {
  const nodes = [
    {
      id: "revenue_growth",
      intent: "revenue_growth",
      keywords: ["faturamento", "receita", "vender mais", "aumentar"],
      participants: [
        "executive_context",
        "marketing",
        "sales",
        "finance",
        "forecast",
        "innovation",
        "ceo",
      ] as ExecutiveParticipantId[],
    },
    {
      id: "cost_reduction",
      intent: "cost_reduction",
      keywords: ["custo", "reduzir", "economia", "despesa"],
      participants: [
        "operations",
        "finance",
        "innovation",
        "experience",
        "wisdom",
        "ceo",
      ] as ExecutiveParticipantId[],
    },
    {
      id: "expansion",
      intent: "expansion",
      keywords: ["unidade", "abrir", "expandir", "filial"],
      participants: [
        "finance",
        "legal",
        "hr",
        "operations",
        "innovation",
        "project_generator",
        "ceo",
      ] as ExecutiveParticipantId[],
    },
    {
      id: "business_improvement",
      intent: "business_improvement",
      keywords: ["barbearia", "melhorar", "precisa", "otimizar"],
      participants: [
        "marketing",
        "crm",
        "google_business",
        "innovation",
        "project_generator",
        "ceo",
      ] as ExecutiveParticipantId[],
    },
  ];

  return ExecutiveDecisionTree.create({
    companyId,
    name: "Samuel AI Executive Decision Tree",
    nodes,
    defaultParticipants: ["executive_context", "innovation", "ceo"],
  });
}
