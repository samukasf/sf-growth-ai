import type { AIProvider } from "../domain/ports/ai-provider.port";
import { AIProviderValidationError } from "../shared/errors/ai-provider.errors";
import type { AIProviderType } from "../shared/types/identifiers";

/**
 * Provider Catalog — mecanismo de extensão do AI Gateway.
 *
 * O núcleo do Gateway (`DefaultAIProviderFactory`, o registry de instâncias,
 * o selector e o use case de execução) nunca conhece nomes de providers
 * específicos: ele só conversa com este catálogo. Para adicionar um novo
 * provider no futuro (ex.: um LLM que ainda não existe hoje):
 *
 *   1. Criar `core/ai-provider/providers/<novo>-provider.ts` implementando `AIProvider`.
 *   2. Chamar `registerAIProviderBlueprint({ type, label, create })` no fim do arquivo.
 *   3. Importar esse arquivo (por efeito colateral) em `providers/index.ts`.
 *
 * Nenhum arquivo do núcleo do Gateway precisa ser alterado.
 */
export type AIProviderBlueprint = {
  type: AIProviderType;
  label: string;
  create: (config?: Record<string, string>) => AIProvider;
};

const catalog = new Map<AIProviderType, AIProviderBlueprint>();

export function registerAIProviderBlueprint(blueprint: AIProviderBlueprint): void {
  catalog.set(blueprint.type, blueprint);
}

export function isAIProviderTypeCataloged(type: AIProviderType): boolean {
  return catalog.has(type);
}

export function listCatalogedAIProviderTypes(): AIProviderType[] {
  return [...catalog.keys()];
}

export function listCatalogedAIProviderBlueprints(): AIProviderBlueprint[] {
  return [...catalog.values()];
}

export function createCatalogedAIProvider(
  type: AIProviderType,
  config?: Record<string, string>,
): AIProvider {
  const blueprint = catalog.get(type);
  if (!blueprint) {
    throw new AIProviderValidationError(
      `Nenhum AI provider registrado para o tipo: ${type}. Providers disponíveis: ${listCatalogedAIProviderTypes().join(", ") || "nenhum"}.`,
    );
  }
  return blueprint.create(config);
}

export function createAllCatalogedAIProviders(): AIProvider[] {
  return listCatalogedAIProviderBlueprints().map((blueprint) => blueprint.create());
}
