export type MobileChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

type SamuelChatStreamEvent =
  | { type: "start"; conversationId: string }
  | { type: "delta"; delta: string }
  | { type: "complete"; conversationId: string; message: MobileChatMessage }
  | { type: "warning"; message: string }
  | { type: "error"; message: string };

const API_BASE_URL = "https://sf-growth-ai.vercel.app";

function parseNdjson(text: string): SamuelChatStreamEvent[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as SamuelChatStreamEvent);
}

export async function loadConversation(companyId: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/samuel-ai/chat?companyId=${encodeURIComponent(companyId)}`,
    { credentials: "include" },
  );
  if (!response.ok) throw new Error(`Não foi possível carregar a conversa (${response.status}).`);
  return response.json() as Promise<{
    conversationId: string | null;
    messages: MobileChatMessage[];
  }>;
}

export async function sendMessage(input: {
  companyId: string;
  query: string;
  conversationId: string | null;
  history: MobileChatMessage[];
}) {
  const response = await fetch(`${API_BASE_URL}/api/samuel-ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      companyId: input.companyId,
      query: input.query,
      conversationId: input.conversationId,
      history: input.history,
    }),
  });
  const body = await response.text();
  if (!response.ok) {
    try {
      const payload = JSON.parse(body) as { error?: string };
      throw new Error(payload.error ?? `Falha no Samuel (${response.status}).`);
    } catch (error) {
      if (error instanceof Error && !error.message.startsWith("Unexpected")) throw error;
      throw new Error(`Falha no Samuel (${response.status}).`);
    }
  }

  const events = parseNdjson(body);
  const completion = [...events].reverse().find((event) => event.type === "complete");
  if (completion?.type === "complete") {
    return {
      conversationId: completion.conversationId,
      message: completion.message,
      events,
    };
  }

  const providerError = [...events].reverse().find((event) => event.type === "error");
  if (providerError?.type === "error") throw new Error(providerError.message);

  const content = events
    .filter((event): event is Extract<SamuelChatStreamEvent, { type: "delta" }> => event.type === "delta")
    .map((event) => event.delta)
    .join("")
    .trim();

  return {
    conversationId: input.conversationId,
    message: {
      id: `assistant-${Date.now()}`,
      role: "assistant" as const,
      content: content || "Não foi possível concluir a resposta.",
      timestamp: new Date().toISOString(),
    },
    events,
  };
}

export async function exchangeRealtimeOffer(input: {
  companyId: string;
  conversationId: string | null;
  sdp: string;
}) {
  const response = await fetch(`${API_BASE_URL}/api/samuel-ai/realtime/offer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/sdp",
      "X-Samuel-Company-Id": input.companyId,
      ...(input.conversationId
        ? { "X-Samuel-Conversation-Id": input.conversationId }
        : {}),
    },
    credentials: "include",
    body: input.sdp,
  });

  if (!response.ok) {
    let message = `Voz ao vivo indisponível (${response.status}).`;
    try {
      const payload = (await response.json()) as { error?: string };
      message = payload.error ?? message;
    } catch {
      // Keep provider-safe message.
    }
    throw new Error(message);
  }
  return response.text();
}
