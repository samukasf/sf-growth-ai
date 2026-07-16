import { describe, expect, it } from "vitest";

import { buildExecutiveCompetitorFromContext } from "./executive-competitor.live";

describe("buildExecutiveCompetitorFromContext", () => {
  it("returns null without competitive evidence", () => {
    expect(
      buildExecutiveCompetitorFromContext({
        context: {
          company: {
            id: "c1",
            name: "Acme",
            industry: "SaaS",
            city: null,
            country: null,
            description: null,
            website: null,
            business_stage: null,
            annual_revenue: null,
          },
          businessProfile: null,
          memories: [],
          summary: "Acme",
        },
        intelligence: {
          strengths: ["Produto sólido"],
          weaknesses: [],
          risks: ["Equipe pequena"],
          opportunities: ["Expandir vendas"],
          priorities: ["Fechar pipeline"],
          executiveSummary: "ok",
        },
      }),
    ).toBeNull();
  });

  it("builds competitor intelligence from competitive memories", () => {
    const result = buildExecutiveCompetitorFromContext({
      context: {
        company: {
          id: "c1",
          name: "Acme",
          industry: "SaaS",
          city: null,
          country: null,
          description: null,
          website: null,
          business_stage: null,
          annual_revenue: null,
        },
        businessProfile: null,
        memories: [
          {
            id: "m1",
            company_id: "c1",
            category: "competitor",
            title: "RivalOps",
            content: "Concorrente focado em PME com pricing agressivo.",
            importance: 8,
            source: "manual",
          },
        ],
        summary: "Acme",
      },
    });

    expect(result).not.toBeNull();
    expect(result?.competitors[0]?.name).toBe("RivalOps");
    expect(result?.executiveSummary).toContain("reais de contexto");
  });
});
