import type { AIProviderType } from "../shared";
import { OpenAICompatibleProvider } from "./openai-compatible-provider";
import { registerAIProviderBlueprint } from "./provider-catalog";

/** Grok (xAI) expõe uma API compatível com o formato "chat completions" da OpenAI. */
export class GrokProvider extends OpenAICompatibleProvider {
  readonly id = "grok";
  readonly type: AIProviderType = "grok";
  readonly name = "Grok (xAI)";

  protected readonly apiKeyEnvVar = "GROK_API_KEY";
  protected readonly modelEnvVar = "GROK_MODEL";
  protected readonly defaultModel = "grok-2-latest";
  protected readonly baseUrl = "https://api.x.ai/v1";
}

registerAIProviderBlueprint({
  type: "grok",
  label: "Grok (xAI)",
  create: () => new GrokProvider(),
});
