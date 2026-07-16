import { describe, expect, it } from "vitest";

import { buildMarketingExecutive } from "./marketing-executive.service";

describe("buildMarketingExecutive", () => {
  it("marks the local fallback as demonstration data", () => {
    const result = buildMarketingExecutive({ companyName: "Demonstração" });

    expect(result.usesDemoData).toBe(true);
    expect(result.campaignPerformance.length).toBeGreaterThan(0);
  });

  it("preserves a real empty campaign query without injecting mock campaigns", () => {
    const result = buildMarketingExecutive({
      companyName: "Empresa real",
      campaigns: [],
    });

    expect(result.usesDemoData).toBe(false);
    expect(result.campaignPerformance).toEqual([]);
  });
});
