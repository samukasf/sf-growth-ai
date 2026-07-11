import { describe, expect, it, vi } from "vitest";

import { CouncilMember } from "../../domain";
import type { SpecialistOpinionResult, SpecialistPort } from "../../domain/ports/opinion-collector.port";
import { DefaultOpinionCollector } from "./default-opinion-collector";

function member(role: SpecialistPort["role"]) {
  return CouncilMember.create({ sessionId: "session-1", role, name: role });
}

function specialist(
  role: SpecialistPort["role"],
  resolver: () => Promise<SpecialistOpinionResult>,
): SpecialistPort {
  return { role, provideOpinion: resolver };
}

function successResult(label: string): SpecialistOpinionResult {
  return {
    summary: `${label} summary`,
    recommendation: `${label} recommendation`,
    priority: 70,
    confidence: 80,
    risks: [`${label} risk`],
    opportunities: [`${label} opportunity`],
  };
}

describe("DefaultOpinionCollector", () => {
  it("coleta o parecer de todos os conselheiros quando todos têm sucesso", async () => {
    const collector = new DefaultOpinionCollector();
    const members = [member("ceo"), member("finance"), member("marketing")];
    const specialists = [
      specialist("finance", async () => successResult("Finance")),
      specialist("marketing", async () => successResult("Marketing")),
    ];

    const result = await collector.collect("session-1", members, "query", {}, specialists);

    expect(result.failures).toEqual([]);
    expect(result.opinions).toHaveLength(2);
    expect(result.opinions.map((o) => o.role).sort()).toEqual(["finance", "marketing"]);
  });

  it("nunca gera parecer para o CEO, mesmo que exista um specialist para o papel", async () => {
    const collector = new DefaultOpinionCollector();
    const members = [member("ceo")];
    const specialists = [specialist("ceo", async () => successResult("CEO"))];

    const result = await collector.collect("session-1", members, "query", {}, specialists);

    expect(result.opinions).toEqual([]);
    expect(result.failures).toEqual([]);
  });

  it("isola a falha de um conselheiro e continua coletando os demais pareceres", async () => {
    const collector = new DefaultOpinionCollector();
    const members = [member("finance"), member("marketing"), member("sales")];
    const specialists = [
      specialist("finance", async () => successResult("Finance")),
      specialist("marketing", async () => {
        throw new Error("provider indisponível");
      }),
      specialist("sales", async () => successResult("Sales")),
    ];

    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = await collector.collect("session-1", members, "query", {}, specialists);

    expect(result.opinions.map((o) => o.role).sort()).toEqual(["finance", "sales"]);
    expect(result.failures).toEqual([{ role: "marketing", error: "provider indisponível" }]);
    expect(consoleWarn).toHaveBeenCalledTimes(1);

    consoleWarn.mockRestore();
  });

  it("quando todos os conselheiros falham, retorna opinions vazio e failures completo sem lançar", async () => {
    const collector = new DefaultOpinionCollector();
    const members = [member("finance"), member("marketing")];
    const specialists = [
      specialist("finance", async () => {
        throw new Error("timeout");
      }),
      specialist("marketing", async () => {
        throw new Error("IA desabilitada");
      }),
    ];

    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = await collector.collect("session-1", members, "query", {}, specialists);

    expect(result.opinions).toEqual([]);
    expect(result.failures.sort((a, b) => a.role.localeCompare(b.role))).toEqual([
      { role: "finance", error: "timeout" },
      { role: "marketing", error: "IA desabilitada" },
    ]);

    consoleWarn.mockRestore();
  });

  it("propaga campos aditivos (conclusion/justification/providerId/model) para o parecer", async () => {
    const collector = new DefaultOpinionCollector();
    const members = [member("finance")];
    const specialists = [
      specialist("finance", async () => ({
        ...successResult("Finance"),
        conclusion: "Conclusão de IA",
        justification: "Justificativa de IA",
        providerId: "openai",
        model: "gpt-4o-mini",
      })),
    ];

    const result = await collector.collect("session-1", members, "query", {}, specialists);

    expect(result.opinions[0].conclusion).toBe("Conclusão de IA");
    expect(result.opinions[0].justification).toBe("Justificativa de IA");
    expect(result.opinions[0].providerId).toBe("openai");
    expect(result.opinions[0].model).toBe("gpt-4o-mini");
  });

  it("ignora conselheiros sem specialist correspondente (sem sucesso nem falha)", async () => {
    const collector = new DefaultOpinionCollector();
    const members = [member("finance"), member("legal")];
    const specialists = [specialist("finance", async () => successResult("Finance"))];

    const result = await collector.collect("session-1", members, "query", {}, specialists);

    expect(result.opinions).toHaveLength(1);
    expect(result.failures).toEqual([]);
  });
});
