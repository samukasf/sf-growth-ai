import { describe, expect, it, vi } from "vitest";

import { createExecutiveCouncil } from "../../infrastructure";
import type { SpecialistOpinionResult, SpecialistPort } from "../../domain";
import type { CouncilSpecialistRole } from "../../shared";
import type { ProcessCouncilDto } from "../dto";

function specialist(
  role: CouncilSpecialistRole,
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

function baseDto(overrides: Partial<ProcessCouncilDto> = {}): ProcessCouncilDto {
  return {
    organizationId: "org-1",
    companyId: "company-1",
    requestId: "req-1",
    query: "Analise meu faturamento e sugira ações de marketing",
    suggestedRoles: ["finance", "marketing"],
    ...overrides,
  };
}

describe("ProcessCouncilSessionUseCase (via createExecutiveCouncil)", () => {
  it("processa a sessão normalmente quando todos os conselheiros têm sucesso", async () => {
    const council = createExecutiveCouncil({
      dependencies: {
        specialists: [
          specialist("finance", async () => successResult("Finance")),
          specialist("marketing", async () => successResult("Marketing")),
        ],
      },
    });

    const result = await council.process(baseDto());

    expect(result.opinionFailures).toEqual([]);
    expect(result.opinions.length).toBeGreaterThan(0);
    expect(result.decision).toBeTruthy();
    expect(result.response).toBeTruthy();
  });

  it("isola a falha de um conselheiro: opinionFailures é populado, mas a sessão conclui normalmente", async () => {
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const council = createExecutiveCouncil({
      dependencies: {
        specialists: [
          specialist("finance", async () => successResult("Finance")),
          specialist("marketing", async () => {
            throw new Error("AI Gateway indisponível");
          }),
        ],
      },
    });

    const result = await council.process(baseDto());

    expect(result.opinionFailures).toEqual([{ role: "marketing", error: "AI Gateway indisponível" }]);
    expect(result.opinions.some((o) => o.role === "finance")).toBe(true);
    expect(result.opinions.some((o) => o.role === "marketing")).toBe(false);
    expect(result.decision).toBeTruthy();
    expect(result.response).toBeTruthy();

    consoleWarn.mockRestore();
  });

  it("quando todos os conselheiros falham, conclui a sessão sem lançar e retorna opinionFailures completo", async () => {
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const council = createExecutiveCouncil({
      dependencies: {
        specialists: [
          specialist("finance", async () => {
            throw new Error("timeout");
          }),
          specialist("marketing", async () => {
            throw new Error("EXECUTIVE_COUNCIL_AI_ENABLED=false");
          }),
        ],
      },
    });

    const result = await council.process(baseDto());

    expect(result.opinions).toEqual([]);
    expect(result.opinionFailures.sort((a, b) => a.role.localeCompare(b.role))).toEqual([
      { role: "finance", error: "timeout" },
      { role: "marketing", error: "EXECUTIVE_COUNCIL_AI_ENABLED=false" },
    ]);
    expect(result.consensus).toBeTruthy();
    expect(result.consensus.opinionCount).toBe(0);
    expect(result.decision).toBeTruthy();
    expect(result.response).toBeTruthy();

    consoleWarn.mockRestore();
  });

  it("enriquece o contexto passado aos especialistas com organizationId/companyId/risks/opportunities/priorities do DTO", async () => {
    const receivedContexts: Record<string, unknown>[] = [];

    const council = createExecutiveCouncil({
      dependencies: {
        specialists: [
          {
            role: "finance",
            async provideOpinion(input) {
              receivedContexts.push(input.context);
              return successResult("Finance");
            },
          },
        ],
      },
    });

    await council.process(
      baseDto({
        risks: ["risco-x"],
        opportunities: ["oportunidade-y"],
        priorities: ["prioridade-z"],
        context: { customKey: "customValue" },
        suggestedRoles: ["finance"],
      }),
    );

    expect(receivedContexts).toHaveLength(1);
    expect(receivedContexts[0]).toMatchObject({
      organizationId: "org-1",
      companyId: "company-1",
      risks: ["risco-x"],
      opportunities: ["oportunidade-y"],
      priorities: ["prioridade-z"],
      customKey: "customValue",
    });
  });
});
