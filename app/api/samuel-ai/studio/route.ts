import { randomUUID } from "node:crypto";

import { createConfiguredResponsesProvider } from "@/apps/web/src/core/orchestrator/openai-responses.provider";
import {
  buildStudioPrompt,
  createStarterStudioProject,
  parseGeneratedStudioProject,
  SAMUEL_STUDIO_TEXT_FORMAT,
  studioFailureDiagnostic,
  validateStudioRequest,
} from "@/features/samuel-ai/studio/samuel-studio.server";
import type {
  SamuelStudioGenerateResponse,
  SamuelStudioStatus,
} from "@/features/samuel-ai/studio/samuel-studio.types";

export const runtime = "nodejs";

export async function GET() {
  const gatewayConfigured = Boolean(createConfiguredResponsesProvider());
  const openHandsConfigured = Boolean(
    process.env.OPENHANDS_BASE_URL && process.env.OPENHANDS_API_KEY,
  );
  const status: SamuelStudioStatus = {
    gatewayConfigured,
    openHandsConfigured,
    engines: [
      {
        id: "gateway",
        label: "GPT-OSS via AI Gateway",
        status: gatewayConfigured ? "active" : "configuration_required",
        detail: gatewayConfigured
          ? "Geração de código conectada no servidor."
          : "Gateway ausente; o gerador local de base continuará disponível.",
      },
      {
        id: "sandpack",
        label: "Sandpack Preview",
        status: "active",
        detail: "Editor e prévia React isolados no navegador.",
      },
      {
        id: "piper",
        label: "Piper Voice pt-BR",
        status: "active",
        detail: "Voz neural masculina executada localmente no aparelho.",
      },
      {
        id: "openhands",
        label: "OpenHands",
        status: openHandsConfigured ? "ready" : "configuration_required",
        detail: openHandsConfigured
          ? "Backend externo configurado para uma próxima etapa de execução autônoma."
          : "Conector preparado; exige um backend OpenHands próprio para executar repositórios.",
      },
    ],
  };
  return Response.json(status);
}

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > 160_000) {
      return Response.json({ error: "O projeto enviado é grande demais." }, { status: 413 });
    }
    const input = validateStudioRequest(await request.json());
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    const provider = createConfiguredResponsesProvider({
      maxOutputTokens: 6_000,
      reasoningEffort: "low",
      textFormat: SAMUEL_STUDIO_TEXT_FORMAT,
    });

    if (!provider) {
      const response: SamuelStudioGenerateResponse = {
        project: createStarterStudioProject({ id, type: input.type, brief: input.brief, createdAt }),
        source: "starter",
        warning: "O AI Gateway não está configurado; o Samuel criou uma base local editável.",
      };
      return Response.json(response);
    }

    const completeProject = async (activeProvider: typeof provider) => {
      const completion = await activeProvider.complete({
        payload: {
          systemContext: [
            "Você está operando o Samuel Studio, um gerador seguro de interfaces React.",
            "Sua saída será validada e executada dentro de uma sandbox no navegador.",
            "Siga rigorosamente o formato JSON e as limitações informadas pelo usuário.",
          ].join("\n"),
          userQuery: buildStudioPrompt(input),
          fragments: [],
          metadata: { intent: "creative", product: "samuel-studio" },
        },
      });
      return parseGeneratedStudioProject(completion.content, {
        id,
        type: input.type,
        provider: completion.providerId,
        model: completion.model,
        createdAt,
        fallbackName: input.existingProject?.name ?? "Projeto Samuel",
      });
    };

    let structuredFailure: unknown;
    try {
      const project = await completeProject(provider);
      const response: SamuelStudioGenerateResponse = { project, source: "gateway" };
      return Response.json(response);
    } catch (error) {
      structuredFailure = error;
    }

    const plainProvider = createConfiguredResponsesProvider({
      maxOutputTokens: 6_000,
      reasoningEffort: "low",
    });
    let plainFailure: unknown;
    if (plainProvider) {
      try {
        const project = await completeProject(plainProvider);
        const response: SamuelStudioGenerateResponse = { project, source: "gateway" };
        return Response.json(response);
      } catch (error) {
        plainFailure = error;
      }
    }

    {
      const response: SamuelStudioGenerateResponse = {
        project: createStarterStudioProject({
          id,
          type: input.type,
          brief: input.brief,
          createdAt,
          warningProvider: provider.providerId,
        }),
        source: "starter",
        warning: "O Gateway não devolveu código válido desta vez; o Samuel preservou o trabalho com uma base local funcional.",
        diagnostic: {
          structured: studioFailureDiagnostic(structuredFailure),
          plain: studioFailureDiagnostic(plainFailure),
        },
      };
      return Response.json(response);
    }
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Não foi possível gerar o projeto." },
      { status: 400 },
    );
  }
}
