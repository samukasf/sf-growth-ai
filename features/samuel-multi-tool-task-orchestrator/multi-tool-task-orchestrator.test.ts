import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { areDependenciesMet, resolveStepInput } from "./input-resolver";
import { createMultiToolTaskOrchestrator, planMultiToolTask } from "./multi-tool-task-orchestrator";
import { isMultiToolTaskOrchestratorEnabled } from "./multi-tool-task-orchestrator";

const executeMock = vi.fn();

vi.mock("@/features/samuel-tool-orchestrator", () => ({
  createToolOrchestrator: () => ({
    execute: executeMock,
  }),
}));

describe("planMultiToolTask", () => {
  it("planeja contacts → calendar → gmail para reunião + convite por e-mail", () => {
    const plan = planMultiToolTask(
      "Marque uma reunião com João na sexta às 14h e envie o convite por e-mail.",
    );

    expect(plan).toMatchObject({
      selected: true,
      summary: "Agendar reunião e enviar convite por e-mail.",
    });
    if (!plan.selected) return;

    expect(plan.steps).toHaveLength(3);
    expect(plan.steps[0]).toMatchObject({
      id: "contacts",
      toolName: "google-contacts",
      input: { actionId: "contacts_email", name: "João" },
    });
    expect(plan.steps[1]).toMatchObject({
      id: "calendar",
      toolName: "google-calendar",
      input: expect.objectContaining({ actionId: "calendar_create", title: "Reunião com João" }),
    });
    expect(plan.steps[2]).toMatchObject({
      id: "gmail",
      toolName: "gmail",
      dependsOn: ["contacts"],
    });
  });

  it("não seleciona plano para perguntas de ferramenta única", () => {
    expect(planMultiToolTask("O que tenho hoje?")).toEqual({ selected: false });
  });
});

describe("resolveStepInput", () => {
  it("enriquece corpo do gmail com e-mail do contato e evento do calendário", () => {
    const resolved = resolveStepInput(
      "gmail",
      "gmail",
      { actionId: "reply_message", body: "Convite de reunião." },
      {
        contacts: {
          status: "success",
          output: {
            data: {
              contacts: [{ name: "João Silva", emails: ["joao@empresa.com"] }],
            },
          },
        },
        calendar: {
          status: "success",
          output: {
            data: {
              event: { title: "Reunião com João Silva", startLabel: "14:00" },
            },
          },
        },
      },
    );

    expect(resolved.body).toContain("joao@empresa.com");
    expect(resolved.body).toContain("Reunião com João Silva");
    expect(resolved.body).toContain("14:00");
  });
});

describe("areDependenciesMet", () => {
  it("bloqueia etapa quando dependência não teve sucesso", () => {
    expect(
      areDependenciesMet(["contacts"], {
        contacts: { status: "error" },
      }),
    ).toBe(false);
  });
});

describe("MultiToolTaskOrchestrator", () => {
  let originalKillSwitch: string | undefined;

  beforeEach(() => {
    originalKillSwitch = process.env.SAMUEL_MULTI_TOOL_TASK_ORCHESTRATOR_ENABLED;
    delete process.env.SAMUEL_MULTI_TOOL_TASK_ORCHESTRATOR_ENABLED;
    executeMock.mockReset();
  });

  afterEach(() => {
    if (originalKillSwitch === undefined) {
      delete process.env.SAMUEL_MULTI_TOOL_TASK_ORCHESTRATOR_ENABLED;
    } else {
      process.env.SAMUEL_MULTI_TOOL_TASK_ORCHESTRATOR_ENABLED = originalKillSwitch;
    }
  });

  it("executa etapas em sequência e compartilha resultados", async () => {
    executeMock
      .mockResolvedValueOnce({
        status: "success",
        output: { summary: "E-mail encontrado", data: { contacts: [{ emails: ["joao@x.com"] }] } },
        durationMs: 10,
      })
      .mockResolvedValueOnce({
        status: "success",
        output: { summary: "Evento criado", data: { event: { title: "Reunião", startLabel: "14:00" } } },
        durationMs: 20,
      })
      .mockResolvedValueOnce({
        status: "success",
        output: { summary: "Convite enviado" },
        durationMs: 30,
      });

    const plan = planMultiToolTask(
      "Marque uma reunião com João na sexta às 14h e envie o convite por e-mail.",
    );
    if (!plan.selected) throw new Error("plano esperado");

    const result = await createMultiToolTaskOrchestrator().execute(plan, {
      organizationId: "org",
      companyId: "company",
    });

    expect(result.overallStatus).toBe("success");
    expect(result.steps).toHaveLength(3);
    expect(result.steps.every((step) => step.status === "success")).toBe(true);
    expect(executeMock).toHaveBeenCalledTimes(3);

    const gmailCall = executeMock.mock.calls[2];
    expect(gmailCall[1].body).toContain("joao@x.com");
  });

  it("interrompe apenas a etapa que falha e ignora dependentes", async () => {
    executeMock
      .mockResolvedValueOnce({
        status: "error",
        error: "Contato não encontrado",
        durationMs: 5,
      })
      .mockResolvedValueOnce({
        status: "success",
        output: { summary: "Evento criado" },
        durationMs: 15,
      });

    const plan = planMultiToolTask(
      "Marque uma reunião com João na sexta às 14h e envie o convite por e-mail.",
    );
    if (!plan.selected) throw new Error("plano esperado");

    const result = await createMultiToolTaskOrchestrator().execute(plan, {
      organizationId: "org",
      companyId: "company",
    });

    expect(result.overallStatus).toBe("partial");
    expect(result.steps[0].status).toBe("error");
    expect(result.steps[1].status).toBe("success");
    expect(result.steps[2].status).toBe("skipped");
    expect(executeMock).toHaveBeenCalledTimes(2);
  });
});

describe("isMultiToolTaskOrchestratorEnabled", () => {
  it("respeita kill-switch", () => {
    process.env.SAMUEL_MULTI_TOOL_TASK_ORCHESTRATOR_ENABLED = "false";
    expect(isMultiToolTaskOrchestratorEnabled()).toBe(false);
    delete process.env.SAMUEL_MULTI_TOOL_TASK_ORCHESTRATOR_ENABLED;
    expect(isMultiToolTaskOrchestratorEnabled()).toBe(true);
  });
});
