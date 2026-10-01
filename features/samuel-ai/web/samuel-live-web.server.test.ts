import { describe, expect, it, vi } from "vitest";

import {
  searchSamuelLiveWeb,
  shouldUseSamuelLiveWeb,
} from "./samuel-live-web.server";

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

  it("uses Open-Meteo for weather without any API key", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            results: [
              {
                name: "Lisboa",
                country: "Portugal",
                admin1: "Lisboa",
                latitude: 38.72,
                longitude: -9.14,
              },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            current: {
              temperature_2m: 22.4,
              apparent_temperature: 22.1,
              precipitation: 0,
              rain: 0,
              weather_code: 1,
              wind_speed_10m: 11,
            },
            daily: {
              time: ["2026-10-01", "2026-10-02", "2026-10-03"],
              weather_code: [1, 2, 61],
              temperature_2m_max: [25, 24, 21],
              temperature_2m_min: [16, 15, 14],
              precipitation_probability_max: [10, 20, 70],
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ) as unknown as typeof fetch;

    const result = await searchSamuelLiveWeb({
      query: "Qual a previsão do tempo hoje em Lisboa?",
      fetcher,
      env: {},
    });

    expect(result?.model).toBe("open-meteo");
    expect(result?.summary).toContain("Lisboa");
    expect(result?.summary).toContain("22.4 °C");
    expect(result?.sources[0]?.url).toContain("api.open-meteo.com");
  });

  it("falls back to live Bing RSS when paid API providers are unavailable", async () => {
    const rss = `<?xml version="1.0"?><rss><channel>
      <item>
        <title>Notícia atual</title>
        <link>https://example.com/noticia</link>
        <description>Informação publicada hoje sobre o tema pesquisado.</description>
      </item>
    </channel></rss>`;
    const fetcher = vi.fn().mockResolvedValue(
      new Response(rss, {
        status: 200,
        headers: { "Content-Type": "application/rss+xml" },
      }),
    ) as unknown as typeof fetch;

    const result = await searchSamuelLiveWeb({
      query: "Pesquise notícias atuais sobre inteligência artificial",
      fetcher,
      env: {},
    });

    expect(result?.model).toBe("bing-rss");
    expect(result?.summary).toContain("Informação publicada hoje");
    expect(result?.sources).toEqual([
      { title: "Notícia atual", url: "https://example.com/noticia" },
    ]);
  });
});
