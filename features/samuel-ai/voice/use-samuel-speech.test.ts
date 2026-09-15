import { describe, expect, it } from "vitest";

import {
  resolveSamuelNeuralEngine,
  resolveSamuelNeuralVoiceLabel,
  selectSamuelFeminineVoice,
  selectSamuelPortugueseFallbackVoice,
} from "./use-samuel-speech";

describe("Samuel neural provider metadata", () => {
  it("identifica ElevenLabs, OpenAI e respostas antigas sem cabeçalho", () => {
    expect(resolveSamuelNeuralEngine("elevenlabs")).toBe("elevenlabs-neural");
    expect(resolveSamuelNeuralEngine("openai")).toBe("openai-neural");
    expect(resolveSamuelNeuralEngine(null)).toBe("server-neural");
    expect(resolveSamuelNeuralVoiceLabel("elevenlabs")).toBe("ElevenLabs · Camilla");
    expect(resolveSamuelNeuralVoiceLabel("openai")).toBe("OpenAI · voz feminina");
  });
});

describe("selectSamuelFeminineVoice", () => {
  it("prioriza uma voz feminina brasileira no iPhone", () => {
    const voices = [
      { name: "Luciana", lang: "pt-BR", localService: true },
      { name: "Daniel", lang: "pt-PT", localService: true },
      { name: "Felipe", lang: "pt-BR", localService: true },
    ];

    expect(selectSamuelFeminineVoice(voices)?.name).toBe("Luciana");
  });

  it("não presume que uma voz neutra seja feminina", () => {
    const voices = [
      { name: "Luciana", lang: "pt-BR", localService: true },
      { name: "Português Brasil", lang: "pt-BR", localService: false },
    ];

    expect(selectSamuelFeminineVoice(voices)?.name).toBe("Luciana");
  });

  it("não troca português por uma voz feminina de outro idioma", () => {
    const voices = [
      { name: "Alex", lang: "en-US", localService: true },
      { name: "Daniel", lang: "pt-PT", localService: true },
    ];

    expect(selectSamuelFeminineVoice(voices)).toBeNull();
  });
});

describe("selectSamuelPortugueseFallbackVoice", () => {
  it("usa uma voz portuguesa disponível quando nenhuma feminina específica existe", () => {
    const voices = [
      { name: "Samantha", lang: "en-US", localService: true },
      { name: "Luciana", lang: "pt-BR", localService: true },
    ];

    expect(selectSamuelPortugueseFallbackVoice(voices)?.name).toBe("Luciana");
  });
});
