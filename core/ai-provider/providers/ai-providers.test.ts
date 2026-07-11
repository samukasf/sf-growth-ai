import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DefaultAIProviderFactory } from "../infrastructure/services/default-ai-provider-factory";
import { AIProviderRequestError, AIProviderUnavailableError } from "../shared/errors/ai-provider.errors";
import { AnthropicProvider } from "./anthropic-provider";
import { DeepSeekProvider } from "./deepseek-provider";
import { GeminiProvider } from "./gemini-provider";
import { GrokProvider } from "./grok-provider";
import { LocalModelProvider } from "./simulated-providers";
import { OllamaProvider } from "./ollama-provider";
import { OpenAIProvider } from "./openai-provider";
import {
  createCatalogedAIProvider,
  isAIProviderTypeCataloged,
  registerAIProviderBlueprint,
} from "./provider-catalog";

const ENV_KEYS = [
  "OPENAI_API_KEY",
  "ANTHROPIC_API_KEY",
  "GEMINI_API_KEY",
  "DEEPSEEK_API_KEY",
  "GROK_API_KEY",
  "OLLAMA_ENABLED",
] as const;

const originalEnv: Record<string, string | undefined> = {};

beforeEach(() => {
  for (const key of ENV_KEYS) {
    originalEnv[key] = process.env[key];
    delete process.env[key];
  }
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (originalEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnv[key];
  }
  vi.unstubAllGlobals();
});

describe("Provider Catalog — extensibilidade sem alterar o núcleo", () => {
  it("cria providers de fábrica (openai, anthropic, gemini, deepseek, grok, ollama, local, azure_openai, aws_bedrock, custom)", () => {
    const factory = new DefaultAIProviderFactory();
    const all = factory.createAll();
    const types = all.map((provider) => provider.type);

    expect(types).toEqual(
      expect.arrayContaining([
        "openai",
        "anthropic",
        "gemini",
        "deepseek",
        "grok",
        "ollama",
        "local",
        "azure_openai",
        "aws_bedrock",
        "custom",
      ]),
    );
  });

  it("permite registrar um provider totalmente novo sem tocar no núcleo do Gateway", () => {
    class FutureProvider extends LocalModelProvider {
      readonly id = "future-llm";
      readonly type = "future-llm";
      readonly name = "Future LLM";
    }

    registerAIProviderBlueprint({
      type: "future-llm",
      label: "Future LLM",
      create: () => new FutureProvider(),
    });

    expect(isAIProviderTypeCataloged("future-llm")).toBe(true);

    const factory = new DefaultAIProviderFactory();
    expect(factory.supports("future-llm")).toBe(true);
    const provider = factory.create("future-llm");
    expect(provider.id).toBe("future-llm");
  });

  it("lança erro claro ao pedir um tipo não cadastrado", () => {
    expect(() => createCatalogedAIProvider("does-not-exist")).toThrow();
  });
});

describe("Metadados estruturados (AIProviderResult.metadata)", () => {
  it("inclui provider, model, latência, tokens, custo, timestamp e organizationId", async () => {
    const provider = new LocalModelProvider();
    const result = await provider.generateText({
      organizationId: "org-1",
      prompt: "Diga olá",
    });

    expect(result.metadata.provider).toEqual({ id: "local", type: "local", name: "Modelo Local" });
    expect(result.metadata.model).toBeTruthy();
    expect(result.metadata.latencyMs).toBeGreaterThanOrEqual(0);
    expect(result.metadata.promptTokens).toBeGreaterThan(0);
    expect(result.metadata.completionTokens).toBeGreaterThan(0);
    expect(result.metadata.totalTokens).toBe(
      result.metadata.promptTokens + result.metadata.completionTokens,
    );
    expect(result.metadata.estimatedCostUsd).toBeGreaterThanOrEqual(0);
    expect(result.metadata.timestamp).toBeTruthy();
    expect(result.metadata.organizationId).toBe("org-1");
  });
});

describe("Disponibilidade sem credenciais (fallback gracioso)", () => {
  it("OpenAI/Anthropic/Gemini/DeepSeek/Grok ficam indisponíveis sem API key", () => {
    expect(new OpenAIProvider().isAvailable()).toBe(false);
    expect(new AnthropicProvider().isAvailable()).toBe(false);
    expect(new GeminiProvider().isAvailable()).toBe(false);
    expect(new DeepSeekProvider().isAvailable()).toBe(false);
    expect(new GrokProvider().isAvailable()).toBe(false);
  });

  it("ficam disponíveis quando a respectiva API key é configurada", () => {
    process.env.OPENAI_API_KEY = "sk-test";
    process.env.ANTHROPIC_API_KEY = "sk-test";
    process.env.GEMINI_API_KEY = "sk-test";

    expect(new OpenAIProvider().isAvailable()).toBe(true);
    expect(new AnthropicProvider().isAvailable()).toBe(true);
    expect(new GeminiProvider().isAvailable()).toBe(true);
  });

  it("Ollama fica disponível por padrão (self-hosted) e pode ser desligado explicitamente", () => {
    expect(new OllamaProvider().isAvailable()).toBe(true);
    process.env.OLLAMA_ENABLED = "false";
    expect(new OllamaProvider().isAvailable()).toBe(false);
  });

  it("generateText rejeita com AIProviderUnavailableError quando não há credencial", async () => {
    await expect(new OpenAIProvider().generateText({ organizationId: "org-1", prompt: "oi" })).rejects.toBeInstanceOf(
      AIProviderUnavailableError,
    );
  });
});

describe("Chamadas reais mockadas — OpenAI", () => {
  beforeEach(() => {
    process.env.OPENAI_API_KEY = "sk-test";
  });

  it("monta a requisição corretamente e mapeia a resposta com metadados", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "Olá, mundo" }, finish_reason: "stop" }],
        usage: { prompt_tokens: 12, completion_tokens: 4 },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await new OpenAIProvider().generateText({
      organizationId: "org-42",
      prompt: "Diga olá",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.openai.com/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer sk-test" }),
      }),
    );
    expect(result.content).toBe("Olá, mundo");
    expect(result.metadata.provider.type).toBe("openai");
    expect(result.metadata.model).toBe("gpt-4o-mini");
    expect(result.metadata.promptTokens).toBe(12);
    expect(result.metadata.completionTokens).toBe(4);
    expect(result.metadata.organizationId).toBe("org-42");
    expect(result.metadata.estimatedCostUsd).toBeGreaterThan(0);
  });

  it("propaga falha HTTP como AIProviderRequestError sem lançar exceção não tratada", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 429, text: async () => "rate limited" }),
    );

    await expect(
      new OpenAIProvider().generateText({ organizationId: "org-1", prompt: "oi" }),
    ).rejects.toBeInstanceOf(AIProviderRequestError);
  });

  it("propaga falha de rede como AIProviderRequestError", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    await expect(
      new OpenAIProvider().generateText({ organizationId: "org-1", prompt: "oi" }),
    ).rejects.toBeInstanceOf(AIProviderRequestError);
  });
});

describe("Chamadas reais mockadas — Anthropic e Gemini", () => {
  it("Anthropic mapeia content[].text e usage.input/output_tokens", async () => {
    process.env.ANTHROPIC_API_KEY = "sk-test";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          content: [{ type: "text", text: "Resposta Claude" }],
          usage: { input_tokens: 10, output_tokens: 6 },
          stop_reason: "end_turn",
        }),
      }),
    );

    const result = await new AnthropicProvider().generateText({
      organizationId: "org-1",
      prompt: "oi",
    });

    expect(result.content).toBe("Resposta Claude");
    expect(result.metadata.provider.type).toBe("anthropic");
    expect(result.metadata.promptTokens).toBe(10);
    expect(result.metadata.completionTokens).toBe(6);
  });

  it("Gemini mapeia candidates[0].content.parts e usageMetadata", async () => {
    process.env.GEMINI_API_KEY = "sk-test";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: "Resposta Gemini" }] }, finishReason: "STOP" }],
          usageMetadata: { promptTokenCount: 8, candidatesTokenCount: 5 },
        }),
      }),
    );

    const result = await new GeminiProvider().generateText({
      organizationId: "org-1",
      prompt: "oi",
    });

    expect(result.content).toBe("Resposta Gemini");
    expect(result.metadata.provider.type).toBe("gemini");
    expect(result.metadata.promptTokens).toBe(8);
    expect(result.metadata.completionTokens).toBe(5);
  });
});
