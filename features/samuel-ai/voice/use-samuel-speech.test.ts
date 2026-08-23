import { describe, expect, it } from "vitest";

import {
  selectSamuelMasculineVoice,
  selectSamuelPortugueseFallbackVoice,
} from "./use-samuel-speech";

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
