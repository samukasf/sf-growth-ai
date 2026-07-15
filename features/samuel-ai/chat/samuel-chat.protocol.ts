import type { ChatMessage } from "../types";
import type { SamuelChatRequest, SamuelChatStreamEvent } from "./samuel-chat.types";

export const MAX_CHAT_QUERY_LENGTH = 8_000;
export const MAX_CHAT_HISTORY_MESSAGES = 20;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sanitizeHistory(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isRecord)
    .map((message) => ({
      id: typeof message.id === "string" ? message.id : crypto.randomUUID(),
      role: message.role === "assistant" ? "assistant" as const : "user" as const,
      content: typeof message.content === "string" ? message.content.slice(0, 16_000) : "",
      timestamp:
        typeof message.timestamp === "string"
          ? message.timestamp
          : new Date().toISOString(),
    }))
    .filter((message) => message.content.trim().length > 0)
    .slice(-MAX_CHAT_HISTORY_MESSAGES);
}

export function parseSamuelChatRequest(value: unknown): SamuelChatRequest {
  if (!isRecord(value)) {
    throw new Error("Corpo da requisição inválido.");
  }

  const query = typeof value.query === "string" ? value.query.trim() : "";
  const companyId =
    typeof value.companyId === "string" ? value.companyId.trim() : "";

  if (!query) throw new Error("A mensagem é obrigatória.");
  if (query.length > MAX_CHAT_QUERY_LENGTH) {
    throw new Error(`A mensagem excede ${MAX_CHAT_QUERY_LENGTH} caracteres.`);
  }
  if (!companyId || companyId.length > 160) {
    throw new Error("Empresa inválida.");
  }

  return {
    query,
    companyId,
    conversationId:
      typeof value.conversationId === "string" && value.conversationId
        ? value.conversationId
        : null,
    history: sanitizeHistory(value.history),
    companyContext: isRecord(value.companyContext)
      ? value.companyContext as SamuelChatRequest["companyContext"]
      : null,
  };
}

export function encodeChatEvent(event: SamuelChatStreamEvent): Uint8Array {
  return new TextEncoder().encode(`${JSON.stringify(event)}\n`);
}

export function parseChatEventLine(line: string): SamuelChatStreamEvent | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  return JSON.parse(trimmed) as SamuelChatStreamEvent;
}
