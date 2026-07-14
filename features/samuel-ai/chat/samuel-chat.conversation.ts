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
) {
  const normalized = normalize(query);

  if (/^(oi|ola|boas|bom dia|boa tarde|boa noite)\b/.test(normalized)) {
    return "Olá! Sou o Samuel AI. Posso ajudar com estratégia, tecnologia, ideias, escrita e muitos outros temas. Sobre o que gostaria de conversar?";
  }

  if (/^(obrigad|valeu|agradecid)/.test(normalized)) {
    return "Por nada! Quando quiser, podemos continuar a conversa.";
  }

  if (/(quem e voce|quem es tu|o que voce faz|o que fazes)/.test(normalized)) {
    return "Sou o Samuel AI, a inteligência conversacional do SF Growth AI. Posso conversar sobre temas gerais e, quando for útil, usar o contexto empresarial do Samuel Runtime para apoiar decisões.";
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

  return "A inteligência generativa do Samuel AI ainda não está configurada neste ambiente. Adicione a variável OPENAI_API_KEY no servidor para liberar conversas completas sobre qualquer tema. O Samuel Runtime continua disponível para análises empresariais estruturadas.";
}
