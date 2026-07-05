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

const ALIGNMENT_LABELS: Record<
  ExecutiveConversation["executiveConsensus"]["alignment"],
  string
> = {
  strong: "forte",
  moderate: "moderado",
  divergent: "divergente",
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
  const alignment = ALIGNMENT_LABELS[conversation.executiveConsensus.alignment];
  const immediateAction =
    conversation.executiveConsensus.primaryRecommendation;
  const supportingPoint =
    conversation.executiveConsensus.supportingPoints[0] ??
    conversation.executiveConsensus.narrative;

  return [
    `Analisei sua diretriz com o Conselho Executivo da ${company}.`,
    "",
    `Diagnóstico: foco em ${intentLabel} com confiança ${conversation.confidenceScore}/100, baseada em ${consulted.length} área(s) consultada(s).`,
    "",
    `Consenso ${alignment}: ${conversation.executiveConsensus.primaryRecommendation}`,
    "",
    `Ação imediata: ${immediateAction}`,
    "",
    `Diretriz operacional: ${supportingPoint}`,
    "",
    `Impacto esperado: execução priorizada nos próximos 30 dias com alinhamento entre ${consulted.map((p) => p.domain).join(", ")}.`,
  ].join("\n");
}
