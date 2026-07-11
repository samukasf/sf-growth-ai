import { createAIProvider } from "@/core/ai-provider";

import {
  resolveGatewayOperation,
  resolveSamuelOperation,
  type SamuelAIOperation,
} from "./ai-gateway-operations";
import type { RuntimeAIGatewayMetadata } from "./types";

/**
 * Ponte entre o Samuel Runtime e o AI Gateway (`@/core/ai-provider`).
 *
 * Isola a única chamada ao Gateway feita pelo runtime: monta o prompt
 * executivo a partir do que o pipeline já calculou (Company Brain,
 * Executive Council, Decision) e devolve `null` em qualquer cenário de
 * falha — nenhum provider configurado, timeout, erro de rede, etc. Quando
 * `null` é retornado, `samuel-runtime.service.ts` usa a narrativa
 * heurística/template já existente, garantindo que o comportamento atual
 * nunca seja quebrado por indisponibilidade do Gateway.
 *
 * A operação enviada ao Gateway é resolvida por `ai-gateway-operations.ts`
 * (default "reason"), permitindo trocar o modo por contexto/ambiente sem
 * alterar o núcleo do Gateway.
 */

const DEFAULT_TIMEOUT_MS = 8000;

export type GenerateNarrativeViaGatewayInput = {
  organizationId: string;
  companyId: string;
  companyName: string;
  query: string;
  priorities: string[];
  risks: string[];
  opportunities: string[];
  councilConsensus: string;
  decisionRationale: string;
  /** Modo de execução do Gateway para esta chamada. Default: "reason". */
  operation?: SamuelAIOperation;
};

export type AIGatewayNarrativeResult = {
  narrative: string;
  /** Metadata da chamada, para observabilidade (ex.: Execution Memory). */
  metadata: RuntimeAIGatewayMetadata;
};

function isGatewayEnabled(): boolean {
  return process.env.SAMUEL_AI_GATEWAY_ENABLED !== "false";
}

function resolvePreferredProviderType(): string | undefined {
  return process.env.SAMUEL_AI_GATEWAY_PREFERRED_PROVIDER || undefined;
}

function buildExecutivePrompt(input: GenerateNarrativeViaGatewayInput): string {
  const sections = [
    `Você é Samuel, o orquestrador executivo do SF Growth AI, respondendo em português para "${input.companyName}".`,
    "",
    `Pergunta do usuário: ${input.query}`,
    input.priorities.length > 0 ? `Prioridades identificadas pelo Company Brain: ${input.priorities.join("; ")}` : "",
    input.risks.length > 0 ? `Riscos identificados pelo Company Brain: ${input.risks.join("; ")}` : "",
    input.opportunities.length > 0
      ? `Oportunidades identificadas pelo Company Brain: ${input.opportunities.join("; ")}`
      : "",
    input.councilConsensus ? `Consenso do Executive Council: ${input.councilConsensus}` : "",
    input.decisionRationale ? `Racional da decisão: ${input.decisionRationale}` : "",
    "",
    "Escreva a narrativa executiva final (3 a 6 frases, direta e consultiva) que o Samuel deve apresentar ao usuário, conectando diagnóstico e recomendação.",
  ];

  return sections.filter((line) => line.length > 0).join("\n");
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`AI Gateway excedeu o timeout de ${ms}ms`));
    }, ms);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

/**
 * Gera a narrativa executiva via AI Gateway. Retorna `null` (sem lançar
 * exceção) sempre que o Gateway não puder responder — chamador deve tratar
 * `null` como "usar fallback heurístico". Quando bem-sucedido, também
 * devolve a metadata da chamada (provider, model, tokens, custo) para
 * consumidores de observabilidade (ex.: Execution Memory).
 */
export async function generateNarrativeViaAIGateway(
  input: GenerateNarrativeViaGatewayInput,
): Promise<AIGatewayNarrativeResult | null> {
  if (!isGatewayEnabled()) {
    return null;
  }

  try {
    const gateway = createAIProvider();
    const prompt = buildExecutivePrompt(input);

    const samuelOperation = resolveSamuelOperation(input.operation);
    const { gatewayOperation, supported } = resolveGatewayOperation(samuelOperation);

    if (!supported) {
      console.warn(
        `[samuel-runtime] Modo "${samuelOperation}" ainda não é suportado pelo núcleo do AI Gateway — usando "reason".`,
      );
    }

    const result = await withTimeout(
      gateway.executeRequest({
        organizationId: input.organizationId,
        operation: gatewayOperation,
        prompt,
        preferredType: resolvePreferredProviderType(),
        enableFallback: true,
        context: {
          companyId: input.companyId,
          companyName: input.companyName,
          source: "samuel-runtime",
        },
      }),
      DEFAULT_TIMEOUT_MS,
    );

    const content = result.response.content?.trim();
    if (!content) return null;

    return {
      narrative: content,
      metadata: {
        used: true,
        providerId: result.providerId,
        providerType: result.request.providerType,
        model: result.request.model,
        operation: gatewayOperation,
        promptTokens: result.tokenUsage.promptTokens,
        completionTokens: result.tokenUsage.completionTokens,
        estimatedCostUsd: result.tokenUsage.estimatedCost,
        latencyMs: result.response.latencyMs,
        fallbackUsed: result.fallbackUsed,
      },
    };
  } catch (error) {
    console.warn(
      "[samuel-runtime] AI Gateway indisponível — usando narrativa heurística de fallback.",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}
