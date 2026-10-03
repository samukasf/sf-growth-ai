import { randomUUID } from "node:crypto";

import {
  createConfiguredResponsesProvider,
  planSamuelAgentTurn,
  runSamuelRuntime,
  type LLMCompletionInput,
  type SamuelConversationChannel,
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
  SamuelToolActionPlan,
} from "@/features/samuel-ai/chat/samuel-chat.types";
import { loadGoogleWorkspaceChatSignal } from "@/features/google-workspace/google-workspace-chat.server";
import type { GoogleWorkspaceChatSignal } from "@/features/google-workspace/google-workspace-chat";
import {
  buildGmailActionPlan,
  executeGmailTool,
  gmailResultToFragment,
} from "@/features/gmail";
import {
  buildCalendarActionPlan,
  calendarResultToFragment,
  executeCalendarTool,
} from "@/features/google-calendar";
import { SamuelConversationRepository } from "@/features/samuel-ai/server/samuel-conversation.repository";
import { searchSamuelLiveWeb } from "@/features/samuel-ai/web/samuel-live-web.server";
import {
  musicCommandAcknowledgement,
  musicCommandFragment,
  parseSamuelMusicCommand,
} from "@/features/samuel-ai/music/samuel-music.server";
import { getWorkspaceSessionIdentity } from "@/features/samuel-ai/server/workspace-session";
import type { ChatMessage } from "@/features/samuel-ai/types";
import { authorizeCompanyRequest } from "@/features/auth/server/authorization";
import {
  contentRequestFromQuery,
  generateContentProject,
  isContentCreationRequest,
} from "@/features/samuel-ai/content-studio/samuel-content.server";
import {
  buildSamuelMission,
  finalizeSamuelMission,
  shouldDiscoverLocalBusinesses,
  shouldOpenSiteBuilder,
  updateSamuelMissionStep,
} from "@/features/samuel-ai/agent/samuel-mission";
import { searchGooglePlaces } from "@/features/google-integrations/google-capabilities.server";
import {
  composioGatewayReadiness,
  createComposioConnectLink,
  searchComposioTools,
} from "@/features/samuel-ai/integrations/composio-gateway.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
  workspaceSignal?: GoogleWorkspaceChatSignal,
  toolFragments: string[] = [],
  pendingAction?: SamuelToolActionPlan | null,
  channel: SamuelConversationChannel = "web",
): LLMCompletionInput {
  const response = runtimeResult.response;
  const turnPlan = planSamuelAgentTurn(response.runtime.query, channel);
  const skillContext = turnPlan.context;
  const pendingSurface = pendingAction?.surface === "calendar" ? "GOOGLE AGENDA" : "GMAIL";
  const actionHint = pendingAction
    ? [
        `[${pendingSurface} — AÇÃO PENDENTE] ${pendingAction.title}: ${pendingAction.preview}`,
        `[${pendingSurface} — REGRAS] Não diga que a ação já foi executada. Peça confirmação explícita no cartão de confirmação da UI.`,
      ]
    : [
        "[GMAIL — REGRAS] Só afirme envio/apagamento/arquivo se existir fragmento [GMAIL — EXECUTADO]. Caso contrário, proponha e aguarde confirmação.",
        "[GOOGLE AGENDA — REGRAS] Só afirme criação/edição/cancelamento de evento se existir fragmento [GOOGLE AGENDA — EXECUTADO]. Caso contrário, proponha e aguarde confirmação.",
      ];

  return {
    payload: {
      ...response.runtime.llmPayload,
      userQuery: response.runtime.query,
      metadata: {
        ...response.runtime.llmPayload.metadata,
        channel,
      },
      conversationHistory: selectConversationHistory(history),
      fragments: [
        ...response.runtime.llmPayload.fragments,
        `[RUNTIME] Diagnóstico: ${response.diagnosis}`,
        `[RUNTIME] Recomendação: ${response.recommendation}`,
        `[RUNTIME] Próximo passo: ${response.nextStep}`,
        `[RUNTIME] Evidências consolidadas: ${runtimeResult.evidenceCount}`,
        ...(workspaceSignal?.fragments ?? []),
        ...(skillContext ? [skillContext] : []),
        ...toolFragments,
        ...actionHint,
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

  const auth = await authorizeCompanyRequest(companyId, { allowWorkspaceFallback: true });
  if (!auth.ok) return auth.response;

  const { sessionHash } = await getWorkspaceSessionIdentity();
  const repository = new SamuelConversationRepository();

  if (!repository.available) {
    return Response.json(
      { conversationId: null, messages: [], persistence: "client" },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const history = await repository.loadLatest(sessionHash, companyId, auth.user.id);
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

  const auth = await authorizeCompanyRequest(chatRequest.companyId, {
    allowWorkspaceFallback: true,
  });
  if (!auth.ok) return auth.response;

  const turnPlan = planSamuelAgentTurn(
    chatRequest.query,
    chatRequest.channel ?? "web",
  );
  let mission = buildSamuelMission(chatRequest.query, turnPlan.skills);
  const siteBuilderHandoff = shouldOpenSiteBuilder(chatRequest.query);
  const integrationRequested = turnPlan.skills.some(
    (skill) => skill.id === "integrations",
  );

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
        userId: auth.user.id,
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
      await repository.appendMessage(conversationId, userMessage, {
        channel: turnPlan.channel,
        skills: turnPlan.skills.map((skill) => skill.id),
      });
    } catch {
      persistence = "client";
    }
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: SamuelChatStreamEvent) => {
        if (!request.signal.aborted) controller.enqueue(encodeChatEvent(event));
      };
      const updateMission = (
        skillOrCapabilityId: string,
        status:
          | "queued"
          | "running"
          | "waiting_approval"
          | "delegated"
          | "completed"
          | "blocked",
        evidence?: string,
      ) => {
        mission = updateSamuelMissionStep(mission, skillOrCapabilityId, {
          status,
          evidence: evidence ?? null,
        });
        send({ type: "mission_update", mission });
      };

      send({
        type: "start",
        conversationId,
        messageId: userMessage.id,
        persistence,
      });
      send({ type: "mission_plan", mission });

      if (persistence === "client" && repository.available) {
        send({
          type: "warning",
          code: "PERSISTENCE_DEGRADED",
          message: "A conversa está guardada neste dispositivo; a base remota não respondeu.",
        });
      }

      try {
        const musicCommand = parseSamuelMusicCommand(chatRequest.query);
        if (musicCommand) {
          send({ type: "music_action", command: musicCommand });
          updateMission(
            "music",
            "delegated",
            "Comando enviado ao player/Spotify; a confirmação final ocorre no dispositivo.",
          );
        }

        const workspaceSignal = musicCommand
          ? undefined
          : await loadGoogleWorkspaceChatSignal(
              chatRequest.query,
              chatRequest.companyId,
            );

        const canUseCompanyIntegrations = UUID_PATTERN.test(chatRequest.companyId);
        const gmailPlan = canUseCompanyIntegrations
          ? buildGmailActionPlan(chatRequest.query, chatRequest.companyId)
          : null;
        const calendarPlan = gmailPlan
          ? null
          : canUseCompanyIntegrations
            ? buildCalendarActionPlan(chatRequest.query, chatRequest.companyId)
            : null;
        const toolFragments: string[] = [];
        let pendingAction: SamuelToolActionPlan | null = null;
        let liveWebResult: Awaited<ReturnType<typeof searchSamuelLiveWeb>> = null;
        if (musicCommand) {
          toolFragments.push(musicCommandFragment(musicCommand));
        }

        if (integrationRequested) {
          updateMission(
            "integrations",
            "running",
            "Procurando ferramentas e contas conectadas no gateway…",
          );
          const readiness = composioGatewayReadiness();
          if (!readiness.configured) {
            const message =
              "Gateway de integrações disponível no SF, mas falta configurar COMPOSIO_API_KEY no servidor.";
            updateMission("integrations", "blocked", message);
            send({
              type: "warning",
              code: "INTEGRATION_GATEWAY_NOT_CONFIGURED",
              message,
            });
          } else {
            try {
              const discovery = await searchComposioTools({
                userId: auth.user.id,
                companyId: chatRequest.companyId,
                useCase: chatRequest.query,
              });
              const primaryTools = discovery.primaryToolSlugs.slice(0, 8);
              const toolkits = discovery.toolkits.slice(0, 8);
              toolFragments.push(
                [
                  "[INTEGRATION GATEWAY — FERRAMENTAS DESCOBERTAS]",
                  toolkits.length
                    ? `Toolkits: ${toolkits.join(", ")}`
                    : "Toolkit específico não identificado.",
                  primaryTools.length
                    ? `Ferramentas principais: ${primaryTools.join(", ")}`
                    : "Nenhuma ferramenta principal foi devolvida.",
                  discovery.recommendedPlanSteps.length
                    ? `Plano recomendado: ${discovery.recommendedPlanSteps
                        .slice(0, 6)
                        .join(" → ")}`
                    : "",
                  "Ações externas genéricas continuam exigindo aprovação explícita antes da execução.",
                ]
                  .filter(Boolean)
                  .join("\n"),
              );

              const disconnected =
                discovery.connections.find(
                  (connection) =>
                    !connection.connected &&
                    (!toolkits.length ||
                      toolkits.includes(connection.toolkit)),
                ) ??
                discovery.connections.find((connection) => !connection.connected);

              if (disconnected) {
                const callback = new URL("/samuel-ai", request.url);
                callback.searchParams.set("integration", "connected");
                callback.searchParams.set("toolkit", disconnected.toolkit);
                const link = await createComposioConnectLink({
                  userId: auth.user.id,
                  companyId: chatRequest.companyId,
                  toolkit: disconnected.toolkit,
                  sessionId: discovery.sessionId,
                  callbackUrl: callback.toString(),
                });
                send({
                  type: "integration_connect",
                  connection: {
                    toolkit: disconnected.toolkit,
                    label:
                      disconnected.description?.trim() ||
                      disconnected.toolkit,
                    url: link.redirectUrl,
                    sessionId: discovery.sessionId,
                  },
                });
                updateMission(
                  "integrations",
                  "waiting_approval",
                  `Integração ${disconnected.toolkit} encontrada; conecte a conta para continuar.`,
                );
              } else {
                updateMission(
                  "integrations",
                  "waiting_approval",
                  primaryTools.length
                    ? `Ferramentas encontradas: ${primaryTools.join(", ")}. A execução externa aguarda aprovação explícita.`
                    : "Integração encontrada; a execução externa aguarda aprovação explícita.",
                );
              }
            } catch (integrationError) {
              const message =
                integrationError instanceof Error
                  ? integrationError.message
                  : "Falha ao consultar o gateway de integrações.";
              updateMission("integrations", "blocked", message);
              send({
                type: "warning",
                code: "INTEGRATION_GATEWAY_UNAVAILABLE",
                message,
              });
            }
          }
        }

        if (shouldDiscoverLocalBusinesses(chatRequest.query)) {
          updateMission("lead-discovery", "running", "Consultando Google Places…");
          try {
            const places = await searchGooglePlaces(
              chatRequest.companyId,
              chatRequest.query,
              20,
            );
            if (places.length) {
              const compact = places
                .slice(0, 20)
                .map(
                  (place, index) =>
                    `${index + 1}. ${place.name} | ${place.address ?? "sem endereço"} | ${place.phone ?? "sem telefone"} | ${place.website ?? place.googleMapsUrl ?? "sem site"}`,
                )
                .join("\n");
              toolFragments.push(
                `[LEAD DISCOVERY — GOOGLE PLACES] Foram encontrados ${places.length} negócios reais.\n${compact}`,
              );
              updateMission(
                "lead-discovery",
                "completed",
                `${places.length} negócios encontrados com dados do Google Places.`,
              );
            } else {
              updateMission(
                "lead-discovery",
                "completed",
                "Pesquisa concluída; nenhum negócio correspondente foi encontrado.",
              );
            }
          } catch (leadError) {
            const message =
              leadError instanceof Error
                ? leadError.message
                : "Falha ao pesquisar empresas no Google Places.";
            updateMission("lead-discovery", "blocked", message);
            send({
              type: "warning",
              code: "LEAD_DISCOVERY_UNAVAILABLE",
              message,
            });
          }
        }

        if (!musicCommand) try {
          updateMission("research.company", "running", "Consultando fontes atuais…");
          const company = chatRequest.companyContext?.executiveContext?.company;
          const locationHint = [company?.city, company?.country]
            .filter(Boolean)
            .join(", ");
          liveWebResult = await searchSamuelLiveWeb({
            query: chatRequest.query,
            locationHint: locationHint || null,
            signal: request.signal,
          });
          if (liveWebResult) {
            if (liveWebResult.sources.length) {
              send({ type: "web_sources", sources: liveWebResult.sources });
            }
            toolFragments.push(
              `[WEB AO VIVO — PESQUISA VERIFICADA] ${liveWebResult.summary}`,
              liveWebResult.sources.length
                ? `[WEB AO VIVO — FONTES] ${liveWebResult.sources
                    .map((source) => `${source.title}: ${source.url}`)
                    .join(" | ")}`
                : "[WEB AO VIVO — FONTES] A pesquisa não devolveu URLs citáveis.",
            );
            updateMission(
              "research.company",
              "completed",
              liveWebResult.sources.length
                ? `${liveWebResult.sources.length} fontes atuais consultadas.`
                : "Pesquisa atual concluída sem URLs citáveis.",
            );
          } else {
            updateMission(
              "research.company",
              "completed",
              "A pesquisa ao vivo não era necessária para concluir esta etapa.",
            );
          }
        } catch (webError) {
          if (request.signal.aborted) throw webError;
          console.warn("Samuel live web search unavailable", {
            message:
              webError instanceof Error
                ? webError.message.slice(0, 500)
                : "falha desconhecida",
          });
          const warningMessage =
            "A pesquisa em tempo real ficou indisponível nesta resposta; não vou tratar dados atuais como verificados.";
          updateMission("research.company", "blocked", warningMessage);
          send({
            type: "warning",
            code: "LIVE_WEB_UNAVAILABLE",
            message: warningMessage,
          });
        }

        if (siteBuilderHandoff) {
          updateMission(
            "site-builder",
            "delegated",
            "Briefing preparado para o Site Builder; o preview editável será aberto ao concluir a resposta.",
          );
          toolFragments.push(
            `[SITE BUILDER — HANDOFF PREPARADO] O pedido foi convertido em briefing para o Site Builder. Não diga que o site já foi publicado. O preview editável será aberto depois desta resposta.`,
          );
        }

        if (isContentCreationRequest(chatRequest.query)) {
          updateMission("content", "running", "Criando o projeto no Samuel Studio…");
          const generatedContent = await generateContentProject(contentRequestFromQuery(chatRequest.query));
          send({ type: "content_project", project: generatedContent.project });
          toolFragments.push(
            `[STUDIO — PRODUÇÃO INICIADA] ${generatedContent.project.name}. O projeto foi enviado ao Studio e a produção automática de narração + vídeo foi iniciada. Só afirme que o MP4 ficou pronto quando a interface do Studio apresentar a prévia final. Não afirme publicação externa sem confirmação e ID da plataforma.`,
          );
          updateMission(
            "content",
            "completed",
            `Projeto "${generatedContent.project.name}" criado no Studio; renderização final continua no módulo de produção.`,
          );
        }

        if (gmailPlan) {
          if (gmailPlan.requiresConfirmation) {
            updateMission(
              "gmail",
              "waiting_approval",
              "A ação foi preparada e aguarda a sua confirmação explícita.",
            );
            pendingAction = gmailPlan;
            send({ type: "action_proposal", action: gmailPlan });
            toolFragments.push(
              `[GMAIL — PROPOSTA] ${gmailPlan.title}: ${gmailPlan.preview}`,
            );
          } else {
            updateMission("gmail", "running", "Executando a operação no Gmail…");
            const result = await executeGmailTool(
              chatRequest.companyId,
              gmailPlan.actionId,
              gmailPlan.args,
            );
            send({ type: "action_result", result });
            toolFragments.push(gmailResultToFragment(result));
            updateMission(
              "gmail",
              result.ok ? "completed" : "blocked",
              result.summary,
            );
            if (!result.ok && /não conectada|NOT_CONNECTED|NOT_CONFIGURED/i.test(result.summary)) {
              send({
                type: "warning",
                code: "GMAIL_NOT_CONNECTED",
                message:
                  "Gmail não está conectado. Abra /integrations/google/connect e autorize novamente (inclui permissões de organizar/apagar).",
              });
            }
          }
        }

        if (calendarPlan) {
          if (calendarPlan.requiresConfirmation) {
            updateMission(
              "calendar",
              "waiting_approval",
              "A alteração foi preparada e aguarda a sua confirmação explícita.",
            );
            pendingAction = calendarPlan;
            send({ type: "action_proposal", action: calendarPlan });
            toolFragments.push(
              `[GOOGLE AGENDA — PROPOSTA] ${calendarPlan.title}: ${calendarPlan.preview}`,
            );
          } else {
            updateMission("calendar", "running", "Executando a operação na Agenda…");
            const result = await executeCalendarTool(
              chatRequest.companyId,
              calendarPlan.actionId,
              calendarPlan.args,
            );
            send({ type: "action_result", result });
            toolFragments.push(calendarResultToFragment(result));
            updateMission(
              "calendar",
              result.ok ? "completed" : "blocked",
              result.summary,
            );
            if (!result.ok && /não conectada|NOT_CONNECTED|NOT_CONFIGURED|permiss/i.test(result.summary)) {
              send({
                type: "warning",
                code: "GOOGLE_CALENDAR_NOT_CONNECTED",
                message:
                  "Google Agenda não está conectada com permissão de escrita. Abra /integrations/google/connect e autorize novamente.",
              });
            }
          }
        }

        const runtimeResult = await runSamuelRuntime({
          query: chatRequest.query,
          tenantId: `workspace-${chatRequest.companyId}`,
          companyId: chatRequest.companyId,
          userId: auth.user.id,
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
              buildCompletionInput(
                runtimeResult,
                chatRequest.history ?? [],
                workspaceSignal,
                toolFragments,
                pendingAction,
                turnPlan.channel,
              ),
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
          content =
            (musicCommand ? musicCommandAcknowledgement(musicCommand) : "") ||
            toolFragments.map((line) => line.replace(/^\[.*?\]\s*/, "")).join("\n\n") ||
            workspaceSignal?.fallbackAnswer ||
            buildSamuelFallbackAnswer(chatRequest.query, runtimeSummary, {
              providerConfigured: Boolean(provider),
            });
          if (pendingAction) {
            const target = pendingAction.surface === "calendar" ? "Google Agenda" : "Gmail";
            content = `${content}\n\nProposta: ${pendingAction.title}. Confirme no cartão abaixo para eu executar no ${target}.`;
          }
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
              channel: turnPlan.channel,
              skills: turnPlan.skills.map((skill) => skill.id),
              webSources: liveWebResult?.sources ?? [],
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

        mission = finalizeSamuelMission(mission);
        send({ type: "mission_update", mission });

        send({
          type: "complete",
          conversationId,
          message: assistantMessage,
          runtime: runtimeSummary,
          provider: providerId,
          model,
          persistence,
          pendingAction,
          handoff: siteBuilderHandoff
            ? {
                surface: "site-builder",
                payload: {
                  brief: chatRequest.query,
                  source: "samuel-mission",
                },
              }
            : null,
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
