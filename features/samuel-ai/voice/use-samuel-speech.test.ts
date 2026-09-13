import { describe, expect, it } from "vitest";

import {
  resolveSamuelNeuralEngine,
  resolveSamuelNeuralVoiceLabel,
  selectSamuelMasculineVoice,
  selectSamuelPortugueseFallbackVoice,
} from "./use-samuel-speech";

describe("Samuel neural provider metadata", () => {
  it("identifica ElevenLabs, OpenAI e respostas antigas sem cabeçalho", () => {
    expect(resolveSamuelNeuralEngine("elevenlabs")).toBe("elevenlabs-neural");
    expect(resolveSamuelNeuralEngine("openai")).toBe("openai-neural");
    expect(resolveSamuelNeuralEngine(null)).toBe("server-neural");
    expect(resolveSamuelNeuralVoiceLabel("elevenlabs")).toBe("ElevenLabs · Samuel");
    expect(resolveSamuelNeuralVoiceLabel("openai")).toBe("OpenAI · Samuel");
  });
});

describe("selectSamuelMasculineVoice", () => {
  it("prioriza uma voz masculina brasileira no iPhone", () => {
    const voices = [
      { name: "Luciana", lang: "pt-BR", localService: true },
      { name: "Daniel", lang: "pt-PT", localService: true },
      { name: "Felipe", lang: "pt-BR", localService: true },
    ];

    expect(selectSamuelMasculineVoice(voices)?.name).toBe("Felipe");
  });

  it("não presume que uma voz neutra seja masculina", () => {
    const voices = [
      { name: "Luciana", lang: "pt-BR", localService: true },
      { name: "Português Brasil", lang: "pt-BR", localService: false },
    ];

    expect(selectSamuelMasculineVoice(voices)).toBeNull();
  });

  it("não troca português por uma voz masculina de outro idioma", () => {
    const voices = [
      { name: "Alex", lang: "en-US", localService: true },
      { name: "Daniel", lang: "pt-PT", localService: true },
    ];

    expect(selectSamuelMasculineVoice(voices)?.name).toBe("Daniel");
  });
});

describe("selectSamuelPortugueseFallbackVoice", () => {
  it("usa uma voz portuguesa disponível quando nenhuma masculina específica existe", () => {
    const voices = [
      { name: "Samantha", lang: "en-US", localService: true },
      { name: "Luciana", lang: "pt-BR", localService: true },
    ];

    expect(selectSamuelPortugueseFallbackVoice(voices)?.name).toBe("Luciana");
  });
});
