import type { AIOperation } from "@/core/ai-provider";

/**
 * Modos de execução que o Samuel pode solicitar ao AI Gateway.
 *
 * O núcleo do Gateway (`core/ai-provider`) hoje só entende o enum `AIOperation`
 * (`generateText`, `generateStructuredOutput`, `summarize`, `classify`,
 * `extractEntities`, `analyze`, `translate`, `reason`). Este arquivo é a
 * ÚNICA camada de tradução entre a linguagem de operação do Samuel e a do
 * Gateway — para adicionar suporte real a um novo modo (`plan`, `critique`,
 * `evaluate`), basta:
 *
 *   1. O Gateway (`core/ai-provider`) declarar a nova `AIOperation` e o
 *      `runOperation` correspondente (fora do escopo desta sprint).
 *   2. Adicionar uma linha em `SAMUEL_TO_GATEWAY_OPERATION` abaixo.
 *
 * Nenhum outro arquivo do Samuel Runtime precisa mudar.
 */
export type SamuelAIOperation =
  | "reason"
  | "generateText"
  | "summarize"
  | "classify"
  | "extract"
  | "plan"
  | "critique"
  | "evaluate";

export const DEFAULT_SAMUEL_AI_OPERATION: SamuelAIOperation = "reason";

const SAMUEL_OPERATIONS: readonly SamuelAIOperation[] = [
  "reason",
  "generateText",
  "summarize",
  "classify",
  "extract",
  "plan",
  "critique",
  "evaluate",
];

/**
 * Operações já implementadas no núcleo do Gateway hoje. `plan`, `critique`
 * e `evaluate` ainda não têm `AIOperation` equivalente — permanecem como
 * modos reservados até que o Gateway os implemente.
 */
const SAMUEL_TO_GATEWAY_OPERATION: Partial<Record<SamuelAIOperation, AIOperation>> = {
  reason: "reason",
  generateText: "generateText",
  summarize: "summarize",
  classify: "classify",
  extract: "extractEntities",
};

export type ResolvedGatewayOperation = {
  requestedOperation: SamuelAIOperation;
  gatewayOperation: AIOperation;
  supported: boolean;
};

function isSamuelAIOperation(value: string): value is SamuelAIOperation {
  return (SAMUEL_OPERATIONS as readonly string[]).includes(value);
}

/**
 * Decide qual `SamuelAIOperation` usar para uma chamada: prioridade para o
 * valor explícito vindo do contexto da chamada (ex.: `RunSamuelRuntimeInput`),
 * depois a variável de ambiente `SAMUEL_AI_GATEWAY_OPERATION` (permite trocar
 * o padrão por organização/ambiente sem deploy), e por fim o default `reason`.
 */
export function resolveSamuelOperation(explicitOperation?: SamuelAIOperation): SamuelAIOperation {
  if (explicitOperation) return explicitOperation;

  const envOverride = process.env.SAMUEL_AI_GATEWAY_OPERATION;
  if (envOverride && isSamuelAIOperation(envOverride)) {
    return envOverride;
  }

  return DEFAULT_SAMUEL_AI_OPERATION;
}

/**
 * Traduz um `SamuelAIOperation` para a `AIOperation` que o Gateway entende.
 * Quando o modo solicitado ainda não existe no núcleo do Gateway, cai para
 * `reason` (sempre suportado) e sinaliza `supported: false` — o chamador
 * decide se quer logar/alertar, mas a execução nunca é interrompida por um
 * modo futuro ainda não implementado.
 */
export function resolveGatewayOperation(operation: SamuelAIOperation): ResolvedGatewayOperation {
  const gatewayOperation = SAMUEL_TO_GATEWAY_OPERATION[operation];

  if (gatewayOperation) {
    return { requestedOperation: operation, gatewayOperation, supported: true };
  }

  return {
    requestedOperation: operation,
    gatewayOperation: SAMUEL_TO_GATEWAY_OPERATION[DEFAULT_SAMUEL_AI_OPERATION]!,
    supported: false,
  };
}
