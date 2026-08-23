import { describe, expect, it } from "vitest";

import { buildProactiveSamuelGreeting } from "./proactive-samuel";

const base = {
  companyName: "Empresa Teste",
  urgentActions: 0,
  pendingTasks: 0,
  now: new Date("2026-08-23T10:00:00Z"),
};

describe("Samuel proactive visual signal", () => {
  it("stays green when there is nothing requiring attention", () => {
    expect(buildProactiveSamuelGreeting(base).visualTone).toBe("green");
  });

  it.each([
    ["low", "green"],
    ["medium", "blue"],
    ["high", "yellow"],
    ["critical", "red"],
  ] as const)("maps %s priority to %s", (priority, visualTone) => {
    const greeting = buildProactiveSamuelGreeting({
      ...base,
      signals: [
        {
          id: `signal-${priority}`,
          kind: "system",
          priority,
          title: "Existe uma atualização real",
          source: "Teste",
        },
      ],
    });

    expect(greeting.visualTone).toBe(visualTone);
    expect(greeting.hasConcreteSignal).toBe(true);
  });
});
