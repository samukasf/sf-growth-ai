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

    expect(greeting.eyebrow).toBe("Atenção executiva");
    expect(greeting.message).toContain("3 ações urgentes");
    expect(greeting.message).toContain("7 tarefas pendentes");
    expect(greeting.spokenMessage).toContain("senhor");
    expect(greeting.spokenMessage).toContain("Rever o funil comercial");
    expect(greeting.hasConcreteSignal).toBe(true);
    expect(greeting.sourceLabel).toBe("monitorização executiva");
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

    expect(greeting.message).toContain("nenhum evento real exige sua atenção");
    expect(greeting.hasConcreteSignal).toBe(false);
    expect(greeting.actionLabel).toBeNull();
  });

  it("prioriza um sinal crítico real e preserva sua origem", () => {
    const greeting = buildProactiveSamuelGreeting({
      companyName: "Empresa",
      urgentActions: 0,
      pendingTasks: 2,
      signals: [
        {
          id: "gmail-3",
          kind: "email",
          priority: "medium",
          title: "Existem 3 e-mails não lidos",
          source: "Gmail",
        },
        {
          id: "deploy-42",
          kind: "deployment",
          priority: "critical",
          title: "O deploy de produção apresentou uma falha",
          detail: "A versão anterior continua disponível",
          source: "Vercel",
          actionLabel: "Inspecionar deploy",
        },
      ],
      now: new Date("2026-07-16T09:00:00"),
    });

    expect(greeting.id).toBe("deployment:deploy-42");
    expect(greeting.sourceLabel).toBe("Vercel");
    expect(greeting.actionLabel).toBe("Inspecionar deploy");
    expect(greeting.spokenMessage).toContain("Bom dia, senhor");
    expect(greeting.message).toContain("deploy de produção");
  });
});
