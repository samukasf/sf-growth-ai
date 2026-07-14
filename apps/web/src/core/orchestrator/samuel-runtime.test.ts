import { describe, expect, it } from "vitest";

import { runSamuelRuntime } from "./samuel-runtime";

describe("runSamuelRuntime", () => {
  it("runs the real pipeline with the workspace company context", async () => {
    const result = await runSamuelRuntime({
      query: "Como aumentar vendas sem inventar métricas?",
      tenantId: "tenant-acme",
      companyId: "company-acme",
      userId: "user-1",
      company: {
        id: "company-acme",
        name: "Acme Portugal",
        industry: "SaaS B2B",
        location: "Lisboa, Portugal",
        summary: "A Acme vende software de operações para PME.",
        health: { sales: 58 },
        growthScore: 64,
        topPriorities: ["Melhorar conversão comercial"],
        memories: [
          {
            id: "memory-1",
            title: "Conversão atual",
            content: "O funil comercial precisa de validação antes de definir metas.",
            type: "STRATEGY",
            importance: "HIGH",
          },
        ],
      },
    });

    expect(result.response.steps).toHaveLength(7);
    expect(result.response.runtime.companyBrain?.companyName).toBe("Acme Portugal");
    expect(result.response.runtime.companyBrain?.health.sales).toBe(58);
    expect(result.evidenceCount).toBeGreaterThan(0);
    expect(JSON.stringify(result)).not.toContain("GrafGil");
  });
});
