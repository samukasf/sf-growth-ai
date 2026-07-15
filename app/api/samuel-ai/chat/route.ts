import { randomUUID } from "node:crypto";

import {
  createConfiguredResponsesProvider,
  runSamuelRuntime,
  type LLMCompletionInput,
  type SamuelRuntimeCompanyInput,
} from "@/apps/web/src/core/orchestrator";
import {
  encodeChatEvent,
  parseSamuelChatRequest,
} from "@/features/samuel-ai/chat/samuel-chat.protocol";
import {
  buildSamuelFallbackAnswer,
  selectConversationHistory,
} from "@/features/samuel-ai/chat/samuel-chat.conversation";
import type {
  SamuelChatCompanyContext,
  SamuelChatRequest,
  SamuelChatRuntimeSummary,
  SamuelChatStreamEvent,
} from "@/features/samuel-ai/chat/samuel-chat.types";
import { SamuelConversationRepository } from "@/features/samuel-ai/server/samuel-conversation.repository";
import { getWorkspaceSessionIdentity } from "@/features/samuel-ai/server/workspace-session";
import type { ChatMessage } from "@/features/samuel-ai/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function stringifyMemoryContent(value: unknown) {
  return typeof value === "string" ? value : JSON.stringify(value);
}

function mapRuntimeCompany(
  companyId: string,
  context: SamuelChatCompanyContext | null | undefined,
): SamuelRuntimeCompanyInput {
  const executive = context?.executiveContext;
  const company = executive?.company;
  const profile = executive?.businessProfile;
  const location = [company?.city, company?.country].filter(Boolean).join(", ");

  return {
    id: companyId,
    name: company?.name ?? "Empresa",
    industry: profile?.segment ?? company?.industry ?? null,
    location: location || null,
    summary: executive?.summary ?? null,
    profile: profile
      ? {
          positioning: profile.positioning,
          differentiators: profile.differentiators,
          objectives: profile.objectives,
          mission: profile.mission,
          vision: profile.vision,
          valueProposition: profile.value_proposition,
        }
      : {},
    health: context?.health ?? {},
    growthScore: context?.growthScore ?? null,
    executiveSummary: context?.executiveSummary ?? null,
    executiveRecommendation: context?.executiveRecommendation ?? null,
    topPriorities: context?.topPriorities ?? [],
    nextActions: context?.nextActions ?? [],
    memories: (executive?.memories ?? []).slice(0, 100).map((memory) => ({
      id: memory.id,
      title: memory.title,
      content: stringifyMemoryContent(memory.content),
      type: memory.category,
      importance: memory.importance,
      source: memory.source,
      tags: [memory.category, memory.source].filter(Boolean) as string[],
    })),
  };
}

function toRuntimeSummary(
  response: Awaited<ReturnType<typeof runSamuelRuntime>>["response"],
): SamuelChatRuntimeSummary {
  return {
    intent: response.intent.intent,
    confidence: response.confidence,
    diagnosis: response.diagnosis,
    recommendation: response.recommendation,
    nextStep: response.nextStep,
    pipeline: response.steps,
  };
}

function buildCompletionInput(
  runtimeResult: Awaited<ReturnType<typeof runSamuelRuntime>>,
  history: ChatMessage[],
): LLMCompletionInput {
  const response = runtimeResult.response;
  return {
    payload: {
      ...response.runtime.llmPayload,
      userQuery: response.runtime.query,
      conversationHistory: selectConversationHistory(history),
      fragments: [
        ...response.runtime.llmPayload.fragments,
        `[RUNTIME] Diagnóstico: ${response.diagnosis}`,
        `[RUNTIME] Recomendação: ${response.recommendation}`,
        `[RUNTIME] Próximo passo: ${response.nextStep}`,
        `[RUNTIME] Evidências consolidadas: ${runtimeResult.evidenceCount}`,
      ],
    },
  };
}

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function GET(request: Request) {
  const companyId = new URL(request.url).searchParams.get("companyId")?.trim();
  if (!companyId || companyId.length > 160) {
    return jsonError("Empresa inválida.", 400);
  }

  const { sessionHash } = await getWorkspaceSessionIdentity();
  const repository = new SamuelConversationRepository();

  if (!repository.available) {
    return Response.json(
      { conversationId: null, messages: [], persistence: "client" },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const history = await repository.loadLatest(sessionHash, companyId);
    return Response.json(
      {
        conversationId: history?.conversationId ?? null,
        messages: history?.messages ?? [],
        persistence: "supabase",
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { conversationId: null, messages: [], persistence: "client" },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
}

export async function POST(request: Request) {
  let chatRequest: SamuelChatRequest;
  try {
    chatRequest = parseSamuelChatRequest(await request.json());
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Requisição inválida.",
      400,
    );
  }

  const { sessionKey, sessionHash } = await getWorkspaceSessionIdentity();
  const repository = new SamuelConversationRepository();
  let persistence: "supabase" | "client" = repository.available
    ? "supabase"
    : "client";
  let conversationId = chatRequest.conversationId ?? randomUUID();

  try {
    conversationId =
      (await repository.getOrCreate({
        conversationId: chatRequest.conversationId,
        sessionHash,
        companyRef: chatRequest.companyId,
        title: chatRequest.query,
      })) ?? conversationId;
  } catch {
    persistence = "client";
  }

  const userMessage: ChatMessage = {
    id: randomUUID(),
    role: "user",
    content: chatRequest.query,
    timestamp: new Date().toISOString(),
    status: "complete",
  };

  if (persistence === "supabase") {
    try {
      await repository.appendMessage(conversationId, userMessage);
    } catch {
      persistence = "client";
    }
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: SamuelChatStreamEvent) => {
        if (!request.signal.aborted) controller.enqueue(encodeChatEvent(event));
      };

      send({
        type: "start",
        conversationId,
        messageId: userMessage.id,
        persistence,
      });

      if (persistence === "client" && repository.available) {
        send({
          type: "warning",
          code: "PERSISTENCE_DEGRADED",
          message: "A conversa está guardada neste dispositivo; a base remota não respondeu.",
        });
      }

      try {
        const runtimeResult = await runSamuelRuntime({
          query: chatRequest.query,
          tenantId: `workspace-${chatRequest.companyId}`,
          companyId: chatRequest.companyId,
          userId: `session-${sessionHash.slice(0, 16)}`,
          sessionId: sessionKey,
          company: mapRuntimeCompany(
            chatRequest.companyId,
            chatRequest.companyContext,
          ),
        });

        const runtimeSummary = toRuntimeSummary(runtimeResult.response);
        for (const step of runtimeSummary.pipeline) send({ type: "step", step });

        const provider = createConfiguredResponsesProvider();
        let content = "";
        let providerId = "samuel-runtime";
        let model: string | null = null;

        if (provider) {
          providerId = provider.providerId;
          model = provider.model;
          send({ type: "provider", provider: providerId, model });

          try {
            const completion = await provider.stream(
              buildCompletionInput(runtimeResult, chatRequest.history ?? []),
              (delta) => {
                content += delta;
                send({ type: "delta", delta });
              },
              request.signal,
            );
            providerId = completion.providerId;
            model = completion.model;
          } catch (error) {
            if (request.signal.aborted) throw error;
            send({
              type: "warning",
              code: "AI_PROVIDER_FALLBACK",
              message: "A IA generativa não respondeu; o Samuel Runtime assumiu esta resposta.",
            });
            content = "";
            providerId = "samuel-runtime";
            model = null;
          }
        } else {
          send({
            type: "warning",
            code: "AI_PROVIDER_NOT_CONFIGURED",
            message: "A IA generativa não está configurada; esta resposta vem apenas do Samuel Runtime.",
          });
        }

        if (!content) {
          content = buildSamuelFallbackAnswer(chatRequest.query, runtimeSummary);
          send({ type: "provider", provider: providerId, model });
          send({ type: "delta", delta: content });
        }

        const assistantMessage: ChatMessage = {
          id: randomUUID(),
          role: "assistant",
          content,
          timestamp: new Date().toISOString(),
          status: "complete",
        };

        if (persistence === "supabase") {
          try {
            await repository.appendMessage(conversationId, assistantMessage, {
              runtime: runtimeSummary,
              provider: providerId,
              model,
            });
            await repository.setProvider(conversationId, providerId, model);
          } catch {
            persistence = "client";
            send({
              type: "warning",
              code: "PERSISTENCE_DEGRADED",
              message: "A resposta ficará guardada neste dispositivo.",
            });
          }
        }

        send({
          type: "complete",
          conversationId,
          message: assistantMessage,
          runtime: runtimeSummary,
          provider: providerId,
          model,
          persistence,
        });
      } catch (error) {
        if (request.signal.aborted) {
          send({
            type: "cancelled",
            conversationId,
            message: "Resposta cancelada.",
          });
        } else {
          send({
            type: "error",
            code: "SAMUEL_RUNTIME_ERROR",
            message:
              error instanceof Error
                ? error.message
                : "Não foi possível concluir a resposta.",
            retryable: true,
          });
        }
      } finally {
        try {
          controller.close();
        } catch {
          // The browser may have closed the stream after an explicit cancel.
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-cache, no-transform",
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "X-Accel-Buffering": "no",
    },
  });
}
