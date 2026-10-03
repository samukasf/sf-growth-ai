import "server-only";

import { createHash } from "node:crypto";

const COMPOSIO_BASE_URL =
  process.env.COMPOSIO_BASE_URL?.trim() || "https://backend.composio.dev/api/v3.1";

type ComposioSessionResponse = {
  session_id?: string;
  mcp?: { type?: string; url?: string };
  warnings?: Array<{ code?: string; message?: string }>;
  error?: string | { message?: string };
};

export type SamuelIntegrationSearchResult = {
  sessionId: string;
  mcpUrl: string | null;
  useCase: string;
  executionGuidance: string | null;
  difficulty: string | null;
  recommendedPlanSteps: string[];
  primaryToolSlugs: string[];
  relatedToolSlugs: string[];
  toolkits: string[];
  connections: Array<{
    toolkit: string;
    description: string | null;
    connected: boolean;
    statusMessage: string | null;
  }>;
  toolSchemas: Record<string, unknown>;
};

type SearchResponse = {
  success?: boolean;
  error?: string;
  results?: Array<{
    index?: number;
    use_case?: string;
    execution_guidance?: string;
    difficulty?: string;
    recommended_plan_steps?: string[];
    primary_tool_slugs?: string[];
    related_tool_slugs?: string[];
    toolkits?: string[];
    error?: string;
  }>;
  toolkit_connection_statuses?: Array<{
    toolkit?: string;
    description?: string;
    has_active_connection?: boolean;
    status_message?: string;
  }>;
  tool_schemas?: Record<string, unknown>;
};

type LinkResponse = {
  link_token?: string;
  redirect_url?: string;
  connected_account_id?: string;
  error?: string | { message?: string };
};

type ExecuteResponse = {
  data?: unknown;
  error?: string;
  log_id?: string;
  instant_charge?: { amount?: string; currency?: string; charged_by?: string };
};

function apiKey() {
  return process.env.COMPOSIO_API_KEY?.trim() || "";
}

function errorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object" && "error" in payload) {
    const value = (payload as { error?: unknown }).error;
    if (typeof value === "string" && value.trim()) return value;
    if (
      value &&
      typeof value === "object" &&
      "message" in value &&
      typeof (value as { message?: unknown }).message === "string"
    ) {
      return (value as { message: string }).message;
    }
  }
  return fallback;
}

async function composioRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const key = apiKey();
  if (!key) throw new Error("Gateway de integrações ainda não configurado.");

  const response = await fetch(`${COMPOSIO_BASE_URL}${path}`, {
    ...init,
    headers: {
      "x-api-key": key,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => ({}))) as T;

  if (!response.ok) {
    throw new Error(
      errorMessage(
        payload,
        `Composio respondeu HTTP ${response.status}.`,
      ),
    );
  }
  return payload;
}

export function composioGatewayReadiness() {
  const configured = Boolean(apiKey());
  return {
    configured,
    provider: "composio",
    detail: configured
      ? "Gateway dinâmico de integrações disponível."
      : "Adicione COMPOSIO_API_KEY para ativar integrações dinâmicas.",
  };
}

export function composioEntityId(userId: string, companyId: string) {
  return `sf_${createHash("sha256")
    .update(`${userId}:${companyId}:composio-v1`)
    .digest("hex")
    .slice(0, 36)}`;
}

export async function createComposioSession(input: {
  userId: string;
  companyId: string;
  toolkits?: string[];
}) {
  const enabled = input.toolkits
    ?.map((toolkit) => toolkit.trim().toLowerCase())
    .filter(Boolean);

  const payload = await composioRequest<ComposioSessionResponse>(
    "/tool_router/session",
    {
      method: "POST",
      body: JSON.stringify({
        user_id: composioEntityId(input.userId, input.companyId),
        ...(enabled?.length
          ? { toolkits: { enabled: [...new Set(enabled)] } }
          : {}),
        manage_connections: {
          enable: true,
          enable_wait_for_connections: false,
          enable_connection_removal: true,
        },
        workbench: {
          enable: true,
          enable_proxy_execution: false,
        },
      }),
    },
  );

  if (!payload.session_id) {
    throw new Error(
      errorMessage(payload, "Composio não devolveu um session_id."),
    );
  }
  return {
    sessionId: payload.session_id,
    mcpUrl: payload.mcp?.url ?? null,
    warnings: payload.warnings ?? [],
  };
}

export async function searchComposioTools(input: {
  userId: string;
  companyId: string;
  useCase: string;
}): Promise<SamuelIntegrationSearchResult> {
  const useCase = input.useCase.replace(/\s+/g, " ").trim().slice(0, 1500);
  if (!useCase) throw new Error("Objetivo de integração vazio.");

  const session = await createComposioSession(input);
  const payload = await composioRequest<SearchResponse>(
    `/tool_router/session/${encodeURIComponent(session.sessionId)}/search`,
    {
      method: "POST",
      body: JSON.stringify({
        queries: [{ use_case: useCase }],
      }),
    },
  );

  const result = payload.results?.[0];
  if (!payload.success && !result) {
    throw new Error(payload.error || "Nenhuma ferramenta foi encontrada.");
  }

  return {
    sessionId: session.sessionId,
    mcpUrl: session.mcpUrl,
    useCase: result?.use_case || useCase,
    executionGuidance: result?.execution_guidance ?? null,
    difficulty: result?.difficulty ?? null,
    recommendedPlanSteps: result?.recommended_plan_steps ?? [],
    primaryToolSlugs: result?.primary_tool_slugs ?? [],
    relatedToolSlugs: result?.related_tool_slugs ?? [],
    toolkits: result?.toolkits ?? [],
    connections: (payload.toolkit_connection_statuses ?? [])
      .filter((item) => Boolean(item.toolkit))
      .map((item) => ({
        toolkit: item.toolkit as string,
        description: item.description ?? null,
        connected: Boolean(item.has_active_connection),
        statusMessage: item.status_message ?? null,
      })),
    toolSchemas: payload.tool_schemas ?? {},
  };
}

export async function createComposioConnectLink(input: {
  userId: string;
  companyId: string;
  toolkit: string;
  callbackUrl: string;
  sessionId?: string;
}) {
  const toolkit = input.toolkit.trim().toLowerCase();
  if (!/^[a-z0-9_-]{2,80}$/.test(toolkit)) {
    throw new Error("Toolkit inválido.");
  }
  const session = input.sessionId
    ? { sessionId: input.sessionId }
    : await createComposioSession({
        userId: input.userId,
        companyId: input.companyId,
        toolkits: [toolkit],
      });

  const payload = await composioRequest<LinkResponse>(
    `/tool_router/session/${encodeURIComponent(session.sessionId)}/link`,
    {
      method: "POST",
      body: JSON.stringify({
        toolkit,
        callback_url: input.callbackUrl,
      }),
    },
  );
  if (!payload.redirect_url) {
    throw new Error(
      errorMessage(payload, "Não foi possível criar o link de conexão."),
    );
  }
  return {
    sessionId: session.sessionId,
    toolkit,
    redirectUrl: payload.redirect_url,
    connectedAccountId: payload.connected_account_id ?? null,
  };
}

export async function executeComposioTool(input: {
  userId: string;
  companyId: string;
  toolSlug: string;
  arguments?: Record<string, unknown>;
  account?: string | null;
}) {
  const toolSlug = input.toolSlug.trim().toUpperCase();
  if (!/^[A-Z0-9_]{3,180}$/.test(toolSlug)) {
    throw new Error("Ferramenta de integração inválida.");
  }

  const session = await createComposioSession({
    userId: input.userId,
    companyId: input.companyId,
  });
  const payload = await composioRequest<ExecuteResponse>(
    `/tool_router/session/${encodeURIComponent(session.sessionId)}/execute`,
    {
      method: "POST",
      body: JSON.stringify({
        tool_slug: toolSlug,
        arguments: input.arguments ?? {},
        ...(input.account ? { account: input.account } : {}),
        enable_auto_workbench_offload: true,
      }),
    },
  );

  if (payload.error) throw new Error(payload.error);
  return {
    sessionId: session.sessionId,
    toolSlug,
    data: payload.data ?? null,
    logId: payload.log_id ?? null,
    charge: payload.instant_charge ?? null,
  };
}
