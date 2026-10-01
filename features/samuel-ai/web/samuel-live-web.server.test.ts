import { describe, expect, it } from "vitest";

import { shouldUseSamuelLiveWeb } from "./samuel-live-web.server";

describe("Samuel live web routing", () => {
  it("requires live web for weather and fresh information", () => {
    expect(shouldUseSamuelLiveWeb("Qual a previsão do tempo hoje em Lisboa?")).toBe(true);
    expect(shouldUseSamuelLiveWeb("Pesquise as últimas notícias da OpenAI")).toBe(true);
    expect(shouldUseSamuelLiveWeb("Qual a cotação do euro agora?")).toBe(true);
  });

  it("does not search the web for ordinary conversation", () => {
    expect(shouldUseSamuelLiveWeb("Escreva uma mensagem de agradecimento")).toBe(false);
    expect(shouldUseSamuelLiveWeb("Explique o que é branding")).toBe(false);
  });
});
