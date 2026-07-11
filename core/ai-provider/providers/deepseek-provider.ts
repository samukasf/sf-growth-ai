import type { AIProviderType } from "../shared";
import { OpenAICompatibleProvider } from "./openai-compatible-provider";
import { registerAIProviderBlueprint } from "./provider-catalog";

/** DeepSeek expõe uma API compatível com o formato "chat completions" da OpenAI. */
export class DeepSeekProvider extends OpenAICompatibleProvider {
  readonly id = "deepseek";
  readonly type: AIProviderType = "deepseek";
  readonly name = "DeepSeek";

  protected readonly apiKeyEnvVar = "DEEPSEEK_API_KEY";
  protected readonly modelEnvVar = "DEEPSEEK_MODEL";
  protected readonly defaultModel = "deepseek-chat";
  protected readonly baseUrl = "https://api.deepseek.com";
}

registerAIProviderBlueprint({
  type: "deepseek",
  label: "DeepSeek",
  create: () => new DeepSeekProvider(),
});
