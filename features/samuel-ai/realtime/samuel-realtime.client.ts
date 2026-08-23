export type SamuelLiveBootstrap =
  | {
      provider: "openai";
      configured: true;
      fallback: boolean;
      model: string;
    }
  | {
      provider: "gemini";
      configured: true;
      fallback: false;
      model: string;
      token: string;
      websocketUrl: string;
      expiresAt: string;
    };

export async function getSamuelLiveBootstrap(
  companyId: string,
  signal?: AbortSignal,
): Promise<SamuelLiveBootstrap> {
  const response = await fetch("/api/samuel-ai/live/session", {
    method: "GET",
    headers: { "X-Samuel-Company-Id": companyId },
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    let message = `Voz Live indisponível (${response.status}).`;
    try {
      const payload = (await response.json()) as { error?: string };
      message = payload.error ?? message;
    } catch {
      // Keep the generic provider-safe message.
    }
    throw new Error(message);
  }

  return response.json() as Promise<SamuelLiveBootstrap>;
}

function wait(milliseconds: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }

    const timeout = window.setTimeout(resolve, milliseconds);
    signal?.addEventListener(
      "abort",
      () => {
        window.clearTimeout(timeout);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

export async function exchangeSamuelRealtimeOffer(
  offerSdp: string,
  input: {
    companyId: string;
    conversationId?: string | null;
    contextSummary?: string | null;
  },
  signal?: AbortSignal,
): Promise<string> {
  const postOffer = () =>
    fetch("/api/samuel-ai/realtime/offer", {
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

  let response = await postOffer();
  if (response.status === 429) {
    const retryAfterSeconds = Number.parseFloat(response.headers.get("retry-after") ?? "0");
    const retryDelay = Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
      ? Math.min(retryAfterSeconds * 1_000, 2_000)
      : 800;
    await wait(retryDelay, signal);
    response = await postOffer();
  }

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
