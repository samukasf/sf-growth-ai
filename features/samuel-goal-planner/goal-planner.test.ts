import { describe, expect, it } from "vitest";

import { createGoalPlanner } from "./heuristic-goal-planner";

describe("HeuristicGoalPlanner", () => {
  it("produz um plano com objetivo final, etapas e prioridade para BUSINESS", () => {
    const planner = createGoalPlanner();
    const plan = planner.plan({
      query: "Crie um plano de marketing.",
      intentCategory: "BUSINESS",
      intentConfidence: 0.9,
    });

    expect(plan.finalObjective).toContain("Crie um plano de marketing.");
    expect(plan.steps.length).toBeGreaterThan(0);
    expect(plan.priority).toBe("high");
  });

  it("gera etapas com dependências encadeadas e sem ciclos", () => {
    const planner = createGoalPlanner();
    const plan = planner.plan({
      query: "Analise meu faturamento.",
      intentCategory: "ANALYSIS",
      intentConfidence: 0.9,
    });

    const ids = plan.steps.map((step) => step.id);
    for (const step of plan.steps) {
      for (const dependencyId of step.dependsOn) {
        expect(ids).toContain(dependencyId);
        // nenhuma etapa depende de si mesma ou de uma etapa posterior (cadeia linear)
        expect(ids.indexOf(dependencyId)).toBeLessThan(ids.indexOf(step.id));
      }
    }
  });

  it("reduz a prioridade do plano quando a confiança do Intent Router é baixa", () => {
    const planner = createGoalPlanner();
    const highConfidence = planner.plan({
      query: "Responda meus e-mails.",
      intentCategory: "AUTOMATION",
      intentConfidence: 0.9,
    });
    const lowConfidence = planner.plan({
      query: "Responda meus e-mails.",
      intentCategory: "AUTOMATION",
      intentConfidence: 0.2,
    });

    expect(highConfidence.priority).toBe("high");
    expect(lowConfidence.priority).toBe("medium");
  });

  it("nunca reduz a prioridade abaixo de 'low'", () => {
    const planner = createGoalPlanner();
    const plan = planner.plan({
      query: "Quanto é 500x78?",
      intentCategory: "GENERAL_KNOWLEDGE",
      intentConfidence: 0.1,
    });

    expect(plan.priority).toBe("low");
  });

  it("usa o template GENERAL_KNOWLEDGE como fallback para categorias desconhecidas", () => {
    const planner = createGoalPlanner();
    const plan = planner.plan({
      // @ts-expect-error — categoria inexistente propositalmente, para testar o fallback
      intentCategory: "UNKNOWN_CATEGORY",
      query: "Pergunta qualquer.",
      intentConfidence: 0.9,
    });

    expect(plan.steps.length).toBeGreaterThan(0);
  });

  it("produz planos distintos e coerentes para todas as categorias suportadas", () => {
    const planner = createGoalPlanner();
    const categories = [
      "BUSINESS",
      "GENERAL_KNOWLEDGE",
      "HYBRID",
      "AUTOMATION",
      "ANALYSIS",
      "CREATION",
    ] as const;

    for (const category of categories) {
      const plan = planner.plan({ query: "teste", intentCategory: category, intentConfidence: 0.8 });
      expect(plan.steps.length).toBeGreaterThan(0);
      expect(plan.finalObjective.length).toBeGreaterThan(0);
    }
  });

  it("não executa nenhuma ação — apenas devolve dados (sem promessas, sem I/O)", () => {
    const planner = createGoalPlanner();
    const result = planner.plan({
      query: "Crie uma campanha para minha empresa.",
      intentCategory: "BUSINESS",
      intentConfidence: 0.8,
    });

    expect(result).not.toHaveProperty("then");
  });
});
