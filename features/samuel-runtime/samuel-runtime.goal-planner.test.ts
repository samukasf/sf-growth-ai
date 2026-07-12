import { afterEach, describe, expect, it, vi } from "vitest";

import { runSamuelRuntime } from "./samuel-runtime.service";

describe("runSamuelRuntime — Goal Planner (Sprint 82)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("executa a fase goal_planning imediatamente após intent e antes de decision", async () => {
    const phases: string[] = [];

    await runSamuelRuntime({
      query: "Crie uma campanha para minha empresa.",
      animate: false,
      onPhase: (phase) => phases.push(phase),
    });

    const intentIndex = phases.indexOf("intent");
    const goalPlanningIndex = phases.indexOf("goal_planning");
    const decisionIndex = phases.indexOf("decision");

    expect(goalPlanningIndex).toBe(intentIndex + 1);
    expect(goalPlanningIndex).toBeLessThan(decisionIndex);
  });

  it("devolve um plano estruturado coerente com a categoria de intenção detectada", async () => {
    const result = await runSamuelRuntime({
      query: "Analise meu faturamento.",
      animate: false,
    });

    expect(result.goalPlan.finalObjective.length).toBeGreaterThan(0);
    expect(result.goalPlan.steps.length).toBeGreaterThan(0);
    expect(["critical", "high", "medium", "low"]).toContain(result.goalPlan.priority);

    const stepIds = result.goalPlan.steps.map((step) => step.id);
    for (const step of result.goalPlan.steps) {
      for (const dependencyId of step.dependsOn) {
        expect(stepIds).toContain(dependencyId);
      }
    }
  });

  it("não altera nenhuma outra fase do pipeline (Company Brain e Executive Council seguem ativos)", async () => {
    const result = await runSamuelRuntime({
      query: "Explique SEO e aplique na minha empresa.",
      animate: false,
    });

    expect(result.companyBrain.status).toBe("active");
    expect(result.executiveCouncil.status).toBe("ready");
    expect(result.pipeline).toHaveLength(11);
  });

  it("kill-switch SAMUEL_GOAL_PLANNER_ENABLED=false devolve plano vazio sem remover a fase do pipeline", async () => {
    vi.stubEnv("SAMUEL_GOAL_PLANNER_ENABLED", "false");

    const result = await runSamuelRuntime({
      query: "Responda meus e-mails.",
      animate: false,
    });

    expect(result.goalPlan.steps).toEqual([]);
    expect(result.pipeline.find((step) => step.id === "goal_planning")?.status).toBe("complete");
  });
});
