import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fromMock = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  supabase: { from: fromMock },
}));

const { SupabaseQueryTool } = await import("./supabase-query.tool");
const { ToolExecutionError } = await import("../tool-execution-error");

const VALID_COMPANY_ID = "11111111-1111-1111-1111-111111111111";

function baseContext(input: { queryId: string }, companyId: string | undefined = VALID_COMPANY_ID) {
  return {
    requestId: "req-1",
    organizationId: "org-1",
    companyId,
    input: input as never,
    requestedAt: new Date().toISOString(),
  };
}

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
  fromMock.mockReset();
  originalKillSwitch = process.env.SAMUEL_SUPABASE_QUERY_TOOL_ENABLED;
  delete process.env.SAMUEL_SUPABASE_QUERY_TOOL_ENABLED;
});

afterEach(() => {
  if (originalKillSwitch === undefined) delete process.env.SAMUEL_SUPABASE_QUERY_TOOL_ENABLED;
  else process.env.SAMUEL_SUPABASE_QUERY_TOOL_ENABLED = originalKillSwitch;
});

describe("SupabaseQueryTool", () => {
  const tool = new SupabaseQueryTool();

  it("rejeita queryId desconhecido/não autorizado", async () => {
    await expect(
      tool.execute(baseContext({ queryId: "drop_table" })),
    ).rejects.toBeInstanceOf(ToolExecutionError);
  });

  it("rejeita quando companyId está ausente ou não é UUID", async () => {
    await expect(
      tool.execute(baseContext({ queryId: "count_contacts" }, "default-company")),
    ).rejects.toThrow(/companyId ausente ou inválido/);
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("count_contacts: devolve o total real de contacts da empresa", async () => {
    fromMock.mockReturnValue(createCountQueryBuilder({ count: 7, error: null }));

    const result = await tool.execute(baseContext({ queryId: "count_contacts" }));

    expect(fromMock).toHaveBeenCalledWith("contacts");
    expect(result.queryId).toBe("count_contacts");
    expect(result.data.total).toBe(7);
    expect(result.summary).toContain("7");
  });

  it("count_contacts: propaga erro do Supabase como ToolExecutionError", async () => {
    fromMock.mockReturnValue(createCountQueryBuilder({ count: null, error: { message: "boom" } }));

    await expect(tool.execute(baseContext({ queryId: "count_contacts" }))).rejects.toThrow(/boom/);
  });

  it("list_inactive_contacts: filtra apenas contatos sem interação há 30+ dias", async () => {
    const recent = new Date(Date.now() - 5 * 86_400_000).toISOString();
    const stale = new Date(Date.now() - 40 * 86_400_000).toISOString();

    fromMock.mockReturnValue(
      createListQueryBuilder({
        data: [
          { id: "c1", first_name: "Ana", last_name: "Silva", company: "Acme", updated_at: recent },
          { id: "c2", first_name: "Bruno", last_name: null, company: "Beta", updated_at: stale },
        ],
        error: null,
      }),
    );

    const result = await tool.execute(baseContext({ queryId: "list_inactive_contacts" }));

    expect(result.data.inactiveCount).toBe(1);
    expect((result.data.contacts as Array<{ id: string }>)[0].id).toBe("c2");
  });

  it("list_inactive_contacts: devolve resumo neutro quando não há inativos", async () => {
    fromMock.mockReturnValue(createListQueryBuilder({ data: [], error: null }));

    const result = await tool.execute(baseContext({ queryId: "list_inactive_contacts" }));

    expect(result.data.inactiveCount).toBe(0);
    expect(result.summary).toContain("Nenhum cliente inativo");
  });

  it("revenue_current_month: soma o total real de revenues do mês corrente", async () => {
    fromMock.mockReturnValue(
      createRevenueQueryBuilder({
        data: [
          { amount: 100, received_date: "2026-07-05" },
          { amount: "50.5", received_date: "2026-07-20" },
        ],
        error: null,
      }),
    );

    const result = await tool.execute(baseContext({ queryId: "revenue_current_month" }));

    expect(fromMock).toHaveBeenCalledWith("revenues");
    expect(result.data.total).toBe(150.5);
    expect(result.data.recordCount).toBe(2);
  });

  it("nunca lança quando o client Supabase lança uma exceção — normaliza em ToolExecutionError", async () => {
    fromMock.mockImplementation(() => {
      throw new Error("network down");
    });

    await expect(tool.execute(baseContext({ queryId: "count_contacts" }))).rejects.toThrow(
      /network down/,
    );
  });

  it("desliga a execução real quando SAMUEL_SUPABASE_QUERY_TOOL_ENABLED=false (kill-switch)", async () => {
    process.env.SAMUEL_SUPABASE_QUERY_TOOL_ENABLED = "false";

    await expect(tool.execute(baseContext({ queryId: "count_contacts" }))).rejects.toThrow(
      /desabilitada/,
    );
    expect(fromMock).not.toHaveBeenCalled();
  });
});
