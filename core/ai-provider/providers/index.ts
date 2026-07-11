export { BaseAIProvider } from "./base-ai-provider";
export { OpenAICompatibleProvider } from "./openai-compatible-provider";

export type { AIProviderBlueprint } from "./provider-catalog";
export {
  createAllCatalogedAIProviders,
  createCatalogedAIProvider,
  isAIProviderTypeCataloged,
  listCatalogedAIProviderBlueprints,
  listCatalogedAIProviderTypes,
  registerAIProviderBlueprint,
} from "./provider-catalog";

/**
 * Providers reais (chamam a API pública correspondente) e simulados. Importar
 * estes módulos aqui é o único lugar que precisa "conhecer" cada provider —
 * cada arquivo se auto-registra no Provider Catalog ao ser importado. Para
 * adicionar um novo provider no futuro, basta criar o arquivo e adicionar uma
 * linha de import/export abaixo; nenhum outro arquivo do Gateway muda.
 */
export { OpenAIProvider } from "./openai-provider";
export { AnthropicProvider } from "./anthropic-provider";
export { GeminiProvider } from "./gemini-provider";
export { DeepSeekProvider } from "./deepseek-provider";
export { GrokProvider } from "./grok-provider";
export { OllamaProvider } from "./ollama-provider";
export {
  AwsBedrockProvider,
  AzureOpenAIProvider,
  CustomProvider,
  LocalModelProvider,
} from "./simulated-providers";
