import type {
  ConversationIntent,
  ExecutiveConversation,
} from "../services/executive-conversation-orchestrator.service";

const INTENT_LABELS: Record<ConversationIntent, string> = {
  marketing: "Marketing",
  finance: "Financeiro",
  sales: "Vendas",
  operations: "Operações",
  hr: "RH",
  legal: "Jurídico",
  strategy: "Estratégia",
  competition: "Concorrência",
  "google-business": "Google Business",
  meta: "Meta",
  linkedin: "LinkedIn",
  crm: "CRM",
  general: "Estratégia Geral",
};

export function formatConversationIntent(intent: ConversationIntent): string {
  return INTENT_LABELS[intent];
}

export function buildSamuelCeoResponse(
  conversation: ExecutiveConversation,
  companyName?: string,
): string {
  const company = companyName ?? "sua empresa";
  const consulted = conversation.participatingExecutives.filter(
    (participant) => participant.consulted,
  );
  const intentLabel = formatConversationIntent(conversation.primaryIntent);
  const leadConclusion = conversation.executiveReasoning?.conclusions[0];
  const immediateAction =
    conversation.executiveConsensus.primaryRecommendation;
  const operationalDirective =
    leadConclusion?.positiveImpacts[0] ??
    conversation.executiveConsensus.supportingPoints[0] ??
    "Executar com cadência semanal e métricas de conversão visíveis.";

  return [
    `Diretriz executiva — ${company}`,
    "",
    `Diagnóstico: queda ou desvio identificado em ${intentLabel}. Confiança da análise: ${conversation.confidenceScore}/100, com ${consulted.length} área(s) validada(s).`,
    "",
    `Posicionamento: ${conversation.executiveConsensus.primaryRecommendation}`,
    "",
    `Ação imediata: ${immediateAction}`,
    "",
    `Diretriz operacional: ${operationalDirective}`,
    "",
    `Impacto esperado: recuperação de tração em até 30 dias, com governança entre ${consulted.map((p) => p.domain).join(", ")}.`,
  ].join("\n");
}
