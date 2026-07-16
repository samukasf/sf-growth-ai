import type { LLMConversationMessage } from "@/apps/web/src/core/orchestrator";

import type { ChatMessage } from "../types";
import type { SamuelChatRuntimeSummary } from "./samuel-chat.types";

export const MAX_CONVERSATION_CONTEXT_MESSAGES = 20;
export const MAX_CONVERSATION_CONTEXT_CHARS = 60_000;

export function selectConversationHistory(
  history: ChatMessage[],
  maxMessages = MAX_CONVERSATION_CONTEXT_MESSAGES,
  maxChars = MAX_CONVERSATION_CONTEXT_CHARS,
): LLMConversationMessage[] {
  const selected: LLMConversationMessage[] = [];
  let usedChars = 0;

  for (const message of history.slice(-maxMessages).reverse()) {
    const content = message.content.trim();
    if (!content) continue;

    const remaining = maxChars - usedChars;
    if (remaining <= 0) break;

    selected.push({
      role: message.role,
      content: content.length > remaining ? content.slice(-remaining) : content,
    });
    usedChars += Math.min(content.length, remaining);
  }

  return selected.reverse();
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function buildSamuelFallbackAnswer(
  query: string,
  runtimeSummary: SamuelChatRuntimeSummary,
  options: { providerConfigured?: boolean } = {},
) {
  const normalized = normalize(query);

  if (/^(oi|ola|boas|bom dia|boa tarde|boa noite)\b/.test(normalized)) {
    const greeting = normalized.startsWith("bom dia")
      ? "Bom dia"
      : normalized.startsWith("boa tarde")
        ? "Boa tarde"
        : normalized.startsWith("boa noite")
          ? "Boa noite"
          : "Olá";
    return `${greeting}, senhor. Sou o Samuel AI. Estou atento ao seu contexto e pronto para responder de forma objetiva e completa.`;
  }

  if (/^(obrigad|valeu|agradecid)/.test(normalized)) {
    return "À disposição, senhor. Continuarei atento ao contexto relevante.";
  }

  if (/(quem e voce|quem es tu|o que voce faz|o que fazes)/.test(normalized)) {
    return "Sou o Samuel AI, seu assistente executivo no SF Growth AI. Posso conversar sobre temas gerais e, quando houver dados reais no Samuel Runtime, antecipar prioridades e apoiar suas decisões, senhor.";
  }

  const businessIntents = new Set([
    "sales",
    "marketing",
    "software",
    "finance",
    "analysis",
    "strategy",
    "execution",
  ]);

  if (businessIntents.has(runtimeSummary.intent)) {
    return [
      `Diagnóstico\n${runtimeSummary.diagnosis}`,
      `Recomendação\n${runtimeSummary.recommendation}`,
      `Próximo passo\n${runtimeSummary.nextStep}`,
    ].join("\n\n");
  }

  if (options.providerConfigured) {
    return "A inteligência generativa do Samuel AI está temporariamente indisponível. O Samuel Runtime continua online para análises empresariais estruturadas; tente novamente após alguns instantes.";
  }

  return "A inteligência generativa do Samuel AI ainda não está configurada neste ambiente. Adicione a variável OPENAI_API_KEY no servidor para liberar conversas completas sobre qualquer tema. O Samuel Runtime continua disponível para análises empresariais estruturadas.";
}
