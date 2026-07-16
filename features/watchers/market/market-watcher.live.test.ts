import { describe, expect, it } from "vitest";

import { fetchMarketWatcherLiveData } from "./market-watcher.live";

describe("fetchMarketWatcherLiveData", () => {
  it("returns null when there is no live signal source", async () => {
    const result = await fetchMarketWatcherLiveData({
      companyName: "Acme",
      industry: "SaaS",
      memories: [],
      intelligence: null,
      competitor: null,
    });
    expect(result).toBeNull();
  });

  it("builds market payload from company memories", async () => {
    const result = await fetchMarketWatcherLiveData({
      companyName: "Acme",
      industry: "SaaS",
      memories: [
        {
          id: "m1",
          company_id: "c1",
          category: "market",
          title: "Demanda por AI executiva",
          content: "Oportunidade de crescimento no mid-market brasileiro.",
          importance: 9,
          source: "research",
        },
      ],
    });

    expect(result).not.toBeNull();
    expect(result?.signals.length).toBeGreaterThan(0);
    expect(result?.signals[0]?.source).toContain("company-memory");
  });
});
