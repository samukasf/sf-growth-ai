export async function exchangeSamuelRealtimeOffer(
  offerSdp: string,
  input: {
    companyId: string;
    conversationId?: string | null;
    contextSummary?: string | null;
  },
  signal?: AbortSignal,
): Promise<string> {
  const response = await fetch("/api/samuel-ai/realtime/offer", {
    method: "POST",
    headers: {
      "Content-Type": "application/sdp",
      "X-Samuel-Company-Id": input.companyId,
      ...(input.conversationId
        ? { "X-Samuel-Conversation-Id": input.conversationId }
        : {}),
      ...(input.contextSummary
        ? { "X-Samuel-Context-Summary": input.contextSummary.slice(0, 600) }
        : {}),
    },
    body: offerSdp,
    signal,
  });

  if (!response.ok) {
    let message = `Realtime indisponível (${response.status}).`;
    try {
      const payload = (await response.json()) as { error?: string };
      message = payload.error ?? message;
    } catch {
      // The endpoint can return plain text SDP only on success.
    }
    throw new Error(message);
  }

  return response.text();
}
