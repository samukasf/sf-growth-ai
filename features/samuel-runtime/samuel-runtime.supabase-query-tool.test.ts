import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fromMock = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  supabase: { from: fromMock },
}));

const generateNarrativeViaAIGatewayMock = vi.fn();
vi.mock("./ai-gateway-narrative.adapter", () => ({
  generateNarrativeViaAIGateway: generateNarrativeViaAIGatewayMock,
}));

const { runSamuelRuntime } = await import("./samuel-runtime.service");

const VALID_COMPANY_ID = "11111111-1111-1111-1111-111111111111";

function createCountQueryBuilder(result: { count: number | null; error: unknown }) {
  return {
    select: vi.fn(() => ({
      eq: vi.fn().mockResolvedValue(result),
    })),
  };
}

function createListQueryBuilder(result: { data: unknown; error: unknown }) {
  return {
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue(result),
        })),
      })),
    })),
  };
}

function createRevenueQueryBuilder(result: { data: unknown; error: unknown }) {
  return {
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        gte: vi.fn(() => ({
          lt: vi.fn().mockResolvedValue(result),
        })),
      })),
    })),
  };
}

let originalKillSwitch: string | undefined;

beforeEach(() => {
  originalKillSwitch = process.env.SAMUEL_TOOL_CALLING_ENABLED;
  delete process.env.SAMUEL_TOOL_CALLING_ENABLED;
  fromMock.mockReset();
  generateNarrativeViaAIGatewayMock.mockReset().mockResolvedValue(null);
});

afterEach(() => {
  if (originalKillSwitch === undefined) delete process.env.SAMUEL_TOOL_CALLING_ENABLED;
  else process.env.SAMUEL_TOOL_CALLING_ENABLED = originalKillSwitch;
});

describe("runSamuelRuntime — Supabase Query Tool (Sprint 85)", () => {
  it("responde 'Quantos clientes tenho?' com o total real de contacts", async () => {
    fromMock.mockReturnValue(createCountQueryBuilder({ count: 12, error: null }));

    const result = await runSamuelRuntime({
      query: "Quantos clientes tenho?",
      companyId: VALID_COMPANY_ID,
      animate: false,
    });

    expect(result.tooling).toMatchObject({
      attempted: true,
      toolName: "supabase-query",
      status: "success",
    });
    expect(result.response.narrative).toContain("12");
  });

  it("responde 'Quais empresas estão inativas?' com a lista real de contatos sem interação recente", async () => {
    const stale = new Date(Date.now() - 40 * 86_400_000).toISOString();
    fromMock.mockReturnValue(
      createListQueryBuilder({
        data: [{ id: "c1", first_name: "Ana", last_name: "Silva", company: "Acme", updated_at: stale }],
        error: null,
      }),
    );

    const result = await runSamuelRuntime({
      query: "Quais empresas estão inativas?",
      companyId: VALID_COMPANY_ID,
      animate: false,
    });

    expect(result.tooling).toMatchObject({
      attempted: true,
      toolName: "supabase-query",
      status: "success",
    });
    expect(result.response.narrative).toContain("1 cliente(s)");
  });

  it("responde 'Qual foi o faturamento deste mês?' com a soma real de revenues", async () => {
    fromMock.mockReturnValue(
      createRevenueQueryBuilder({
        data: [{ amount: 200, received_date: new Date().toISOString().slice(0, 10) }],
        error: null,
      }),
    );

    const result = await runSamuelRuntime({
      query: "Qual foi o faturamento deste mês?",
      companyId: VALID_COMPANY_ID,
      animate: false,
    });

    expect(result.tooling).toMatchObject({
      attempted: true,
      toolName: "supabase-query",
      status: "success",
    });
    expect(result.response.narrative).toContain("Faturamento registrado neste mês");
  });

  it("degrada com segurança quando companyId não é um UUID real (ex.: 'default-company' do Playground)", async () => {
    const result = await runSamuelRuntime({
      query: "Quantos clientes tenho?",
      animate: false,
    });

    expect(result.tooling.attempted).toBe(true);
    expect(result.tooling.status).toBe("error");
    expect(result.tooling.error).toMatch(/companyId ausente ou inválido/);
    expect(result.response.narrative.length).toBeGreaterThan(0);
  });

  it("continua sem acionar nenhuma ferramenta para 'Analise meu faturamento.' (pergunta de negócio genérica)", async () => {
    const result = await runSamuelRuntime({
      query: "Analise meu faturamento.",
      companyId: VALID_COMPANY_ID,
      animate: false,
    });

    expect(result.tooling).toEqual({ attempted: false });
  });
});
