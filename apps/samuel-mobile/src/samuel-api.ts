import * as SecureStore from "expo-secure-store";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_SF_GROWTH_API_BASE_URL?.trim().replace(/\/$/, "") ||
  "https://sf-growth-ai.vercel.app";
const SESSION_KEY = "samuel.native.session-id";
let cachedSessionId: string | null = null;

export type MobileMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

export type SamuelBootstrap = {
  identity: { id: string; name: string; role: string; continuity: string };
  companyId: string;
  interaction: {
    text: boolean;
    nativeMicrophone: boolean;
    neuralVoice: boolean;
    desktopControl: boolean;
    proactiveNotifications: boolean;
  };
  voice: { persona: string; providerPreference: string };
  capabilities: Array<{
    id: string;
    title: string;
    domain: string;
    availability: "connected" | "planned" | string;
    voiceEnabled: boolean;
  }>;
};

type ChatEvent = {
  type: string;
  conversationId?: string;
  delta?: string;
  message?: MobileMessage;
  code?: string;
};

async function deviceSessionId() {
  if (cachedSessionId) return cachedSessionId;
  const stored = await SecureStore.getItemAsync(SESSION_KEY);
  if (stored) {
    cachedSessionId = stored;
    return stored;
  }
  const created = `mobile-${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
  await SecureStore.setItemAsync(SESSION_KEY, created);
  cachedSessionId = created;
  return created;
}

async function authHeaders(token: string, extra?: Record<string, string>) {
  return {
    Authorization: `Bearer ${token}`,
    "x-samuel-session-id": await deviceSessionId(),
    ...extra,
  };
}

async function errorFromResponse(response: Response) {
  const payload = await response.json().catch(() => null) as
    | { error?: string; code?: string }
    | null;
  const error = new Error(payload?.error || `HTTP ${response.status}`) as Error & { code?: string };
  error.code = payload?.code;
  return error;
}

export async function loadBootstrap(token: string, companyId = "default-company") {
  const response = await fetch(
    `${API_BASE_URL}/api/samuel-ai/mobile/bootstrap?companyId=${encodeURIComponent(companyId)}`,
    { headers: await authHeaders(token) },
  );
  if (!response.ok) throw await errorFromResponse(response);
  return response.json() as Promise<SamuelBootstrap>;
}

export async function transcribeNativeAudio(
  token: string,
  uri: string,
  companyId = "default-company",
) {
  const body = new FormData();
  body.append("audio", {
    uri,
    name: "samuel-native.m4a",
    type: "audio/mp4",
  } as unknown as Blob);

  const response = await fetch(`${API_BASE_URL}/api/samuel-ai/transcribe`, {
    method: "POST",
    headers: await authHeaders(token, { "x-samuel-company-id": companyId }),
    body,
  });
  if (!response.ok) throw await errorFromResponse(response);
  const payload = await response.json() as { text?: string };
  if (!payload.text?.trim()) throw new Error("A transcrição voltou vazia.");
  return payload.text.trim();
}

export async function sendSamuelTurn(input: {
  token: string;
  query: string;
  companyId?: string;
  conversationId?: string | null;
  history?: MobileMessage[];
}) {
  const companyId = input.companyId || "default-company";
  const response = await fetch(`${API_BASE_URL}/api/samuel-ai/chat`, {
    method: "POST",
    headers: await authHeaders(input.token, { "Content-Type": "application/json" }),
    body: JSON.stringify({
      query: input.query,
      companyId,
      conversationId: input.conversationId ?? null,
      history: input.history?.slice(-20) ?? [],
    }),
  });
  if (!response.ok) throw await errorFromResponse(response);

  const events = (await response.text())
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as ChatEvent);
  const terminalError = events.find((event) => event.type === "error");
  if (terminalError) {
    const error = new Error("Samuel não conseguiu concluir este turno.") as Error & { code?: string };
    error.code = terminalError.code;
    throw error;
  }
  const complete = [...events].reverse().find((event) => event.type === "complete");
  const content = complete?.message?.content || events
    .filter((event) => event.type === "delta")
    .map((event) => event.delta || "")
    .join("");
  return {
    conversationId: complete?.conversationId || input.conversationId || null,
    content: content.trim(),
  };
}

export function isLikelyDesktopCommand(text: string) {
  const normalized = text.toLocaleLowerCase("pt-BR");
  const action = /\b(abra|abrir|abre|inicie|iniciar|feche|fechar|clique|clicar|digite|digitar|mostre|mostrar|procure|procurar|navegue|navegar)\b/i.test(normalized);
  const target = /\b(computador|pc|windows|pasta|arquivo|ficheiro|explorador|chrome|edge|calculadora|programa|aplicativo|app|desktop|área de trabalho)\b/i.test(normalized);
  return action && target;
}

export async function executeDesktopCommand(
  token: string,
  goal: string,
  companyId = "default-company",
) {
  const response = await fetch(`${API_BASE_URL}/api/samuel-desktop/voice-command`, {
    method: "POST",
    headers: await authHeaders(token, { "Content-Type": "application/json" }),
    body: JSON.stringify({ goal, companyId }),
  });
  if (!response.ok) throw await errorFromResponse(response);
  const queued = await response.json() as { commandId: string; deviceName: string; status: string };

  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 1_000));
    const statusResponse = await fetch(
      `${API_BASE_URL}/api/samuel-desktop/voice-command?commandId=${encodeURIComponent(queued.commandId)}`,
      { headers: await authHeaders(token) },
    );
    if (!statusResponse.ok) throw await errorFromResponse(statusResponse);
    const status = await statusResponse.json() as {
      terminal: boolean;
      verified: boolean;
      command: { status: string; error_message?: string | null };
    };
    if (!status.terminal) continue;
    if (status.verified) return `Concluído no ${queued.deviceName}.`;
    throw new Error(status.command.error_message || `A execução terminou como ${status.command.status}.`);
  }
  throw new Error("O computador ainda está executando a tarefa.");
}

export async function generateSpeech(token: string, text: string, companyId = "default-company") {
  const response = await fetch(`${API_BASE_URL}/api/samuel-ai/voice/tts`, {
    method: "POST",
    headers: await authHeaders(token, { "Content-Type": "application/json" }),
    body: JSON.stringify({ companyId, text }),
  });
  if (!response.ok) throw await errorFromResponse(response);
  return new Uint8Array(await response.arrayBuffer());
}
