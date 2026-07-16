import { describe, expect, it } from "vitest";

import { buildProactiveSamuelGreeting } from "./proactive-samuel";

describe("buildProactiveSamuelGreeting", () => {
  it("inicia a conversa com sinais e prioridade reais", () => {
    const greeting = buildProactiveSamuelGreeting({
      companyName: "SF Growth AI",
      urgentActions: 3,
      pendingTasks: 7,
      topPriority: "Rever o funil comercial",
    });

    expect(greeting.eyebrow).toBe("Samuel já começou");
    expect(greeting.message).toContain("3 ações urgentes");
    expect(greeting.message).toContain("7 tarefas pendentes");
    expect(greeting.spokenMessage).toContain("Eu sou o Samuel AI");
    expect(greeting.spokenMessage).toContain("Rever o funil comercial");
  });

  it("mantém singular e um estado sem urgências honesto", () => {
    const greeting = buildProactiveSamuelGreeting({
      companyName: "Empresa",
      urgentActions: 0,
      pendingTasks: 1,
    });

    expect(greeting.message).toContain("Não há alertas urgentes");
    expect(greeting.message).toContain("1 tarefa pendente");
  });

  it("não inventa alertas quando não existem pendências", () => {
    const greeting = buildProactiveSamuelGreeting({
      companyName: "Empresa",
      urgentActions: 0,
      pendingTasks: 0,
    });

    expect(greeting.message).toContain("não encontrei pendências urgentes");
  });
});
