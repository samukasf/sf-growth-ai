import { parseChatEventLine } from "./samuel-chat.protocol";
import type {
  SamuelChatHistoryResponse,
  SamuelChatRequest,
  SamuelChatSendOptions,
  SamuelChatSendResult,
} from "./samuel-chat.types";

async function responseError(response: Response) {
  try {
    const payload = await response.json() as { error?: string };
    return payload.error ?? `Pedido falhou (${response.status}).`;
  } catch {
    return `Pedido falhou (${response.status}).`;
  }
}

export async function loadSamuelChatHistory(
  companyId: string,
  signal?: AbortSignal,
): Promise<SamuelChatHistoryResponse> {
  const response = await fetch(
    `/api/samuel-ai/chat?companyId=${encodeURIComponent(companyId)}`,
    { cache: "no-store", signal },
  );

  if (!response.ok) throw new Error(await responseError(response));
  return response.json() as Promise<SamuelChatHistoryResponse>;
}

export async function sendSamuelChatMessage(
  request: SamuelChatRequest,
  options: SamuelChatSendOptions,
): Promise<SamuelChatSendResult> {
  const response = await fetch("/api/samuel-ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...request,
      conversationId: options.conversationId,
      history: options.history,
    }),
    signal: options.signal,
  });

  if (!response.ok) throw new Error(await responseError(response));
  if (!response.body) throw new Error("O servidor não iniciou a resposta.");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let content = "";
  let completed: SamuelChatSendResult | null = null;

  const consumeLine = (line: string) => {
    const event = parseChatEventLine(line);
    if (!event) return;
    options.onEvent?.(event);

    if (event.type === "delta") content += event.delta;
    if (event.type === "error") throw new Error(event.message);
    if (event.type === "cancelled") {
      throw new DOMException(event.message, "AbortError");
    }
    if (event.type === "complete") {
      completed = {
        content: event.message.content || content,
        conversationId: event.conversationId,
        runtime: event.runtime,
        provider: event.provider,
        model: event.model,
      };
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) consumeLine(line);
  }

  buffer += decoder.decode();
  if (buffer.trim()) consumeLine(buffer);

  if (!completed) {
    if (options.signal?.aborted) {
      throw new DOMException("Análise cancelada.", "AbortError");
    }
    throw new Error("A resposta terminou antes da confirmação do Runtime.");
  }

  return completed;
}
