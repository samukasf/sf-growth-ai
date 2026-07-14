import { beforeEach, describe, expect, it, vi } from "vitest";

const fromMock = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  supabase: { from: fromMock },
}));

const getCompanyMemoryMock = vi.fn();
vi.mock("@/services/executive-memory.service", () => ({
  getCompanyMemory: getCompanyMemoryMock,
}));

const { SupabaseCompanyAdapter, SupabaseEnterpriseMemoryAdapter, SupabaseCrmAdapter } = await import(
  "./supabase-data-source-adapters"
);

const VALID_COMPANY_ID = "11111111-1111-1111-1111-111111111111";

function createSingleQueryBuilder(result: { data: unknown; error: unknown }) {
  return {
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        maybeSingle: vi.fn().mockResolvedValue(result),
      })),
    })),
  };
}

function createCountQueryBuilder(result: { count: number | null; error: unknown }) {
  return {
    select: vi.fn(() => ({
      eq: vi.fn().mockResolvedValue(result),
    })),
  };
}

describe("SupabaseCompanyAdapter", () => {
  beforeEach(() => {
    fromMock.mockReset();
  });

  it("devolve available:false quando companyId não é UUID (ex.: 'default-company' do Playground)", async () => {
    const result = await SupabaseCompanyAdapter.fetch("org-1", "default-company");

    expect(result.available).toBe(false);
    expect(result.source).toBe("company");
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("carrega o perfil real da empresa de public.companies", async () => {
    fromMock.mockReturnValue(
      createSingleQueryBuilder({
        data: {
          id: VALID_COMPANY_ID,
          name: "Acme",
          industry: "SaaS",
          city: "São Paulo",
          country: "BR",
          description: "Descrição",
          website: "acme.com",
          business_stage: "growth",
          annual_revenue: 100000,
          employees: 20,
          company_size: "11-50",
        },
        error: null,
      }),
    );

    const result = await SupabaseCompanyAdapter.fetch("org-1", VALID_COMPANY_ID);

    expect(fromMock).toHaveBeenCalledWith("companies");
    expect(result.available).toBe(true);
    expect(result.recordCount).toBe(1);
    expect(result.context.name).toBe("Acme");
    expect(result.healthScore).toBeGreaterThan(0);
  });

  it("devolve available:false quando a empresa não é encontrada", async () => {
    fromMock.mockReturnValue(createSingleQueryBuilder({ data: null, error: null }));

    const result = await SupabaseCompanyAdapter.fetch("org-1", VALID_COMPANY_ID);

    expect(result.available).toBe(false);
    expect(result.recordCount).toBe(0);
  });

  it("devolve available:false quando o Supabase retorna erro, sem lançar", async () => {
    fromMock.mockReturnValue(
      createSingleQueryBuilder({ data: null, error: { message: "boom" } }),
    );

    const result = await SupabaseCompanyAdapter.fetch("org-1", VALID_COMPANY_ID);

    expect(result.available).toBe(false);
    expect(result.context.reason).toBe("boom");
  });

  it("nunca lança quando o client Supabase lança uma exceção", async () => {
    fromMock.mockImplementation(() => {
      throw new Error("network down");
    });

    await expect(SupabaseCompanyAdapter.fetch("org-1", VALID_COMPANY_ID)).resolves.toMatchObject({
      available: false,
    });
  });
});

describe("SupabaseEnterpriseMemoryAdapter", () => {
  beforeEach(() => {
    getCompanyMemoryMock.mockReset();
  });

  it("devolve available:false quando companyId não é UUID", async () => {
    const result = await SupabaseEnterpriseMemoryAdapter.fetch("org-1", "default-company");

    expect(result.available).toBe(false);
    expect(getCompanyMemoryMock).not.toHaveBeenCalled();
  });

  it("agrega memórias reais de public.company_memory", async () => {
    getCompanyMemoryMock.mockResolvedValue([
      {
        id: "1",
        company_id: VALID_COMPANY_ID,
        category: "strategy",
        title: "Missão",
        content: "conteúdo",
        importance: 5,
        source: null,
      },
      {
        id: "2",
        company_id: VALID_COMPANY_ID,
        category: "finance",
        title: "Receita",
        content: "conteúdo",
        importance: 3,
        source: null,
      },
    ]);

    const result = await SupabaseEnterpriseMemoryAdapter.fetch("org-1", VALID_COMPANY_ID);

    expect(result.available).toBe(true);
    expect(result.recordCount).toBe(2);
    expect(result.highlights).toHaveLength(2);
    expect(result.context.categories).toBe("strategy, finance");
  });

  it("devolve available:true com recordCount 0 quando a empresa não tem memórias ainda", async () => {
    getCompanyMemoryMock.mockResolvedValue([]);

    const result = await SupabaseEnterpriseMemoryAdapter.fetch("org-1", VALID_COMPANY_ID);

    expect(result.available).toBe(true);
    expect(result.recordCount).toBe(0);
  });

  it("devolve available:false quando getCompanyMemory lança, sem propagar o erro", async () => {
    getCompanyMemoryMock.mockRejectedValue(new Error("db down"));

    const result = await SupabaseEnterpriseMemoryAdapter.fetch("org-1", VALID_COMPANY_ID);

    expect(result.available).toBe(false);
    expect(result.context.reason).toBe("db down");
  });
});

describe("SupabaseCrmAdapter", () => {
  beforeEach(() => {
    fromMock.mockReset();
  });

  it("devolve available:false quando companyId não é UUID", async () => {
    const result = await SupabaseCrmAdapter.fetch("org-1", "default-company");

    expect(result.available).toBe(false);
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("agrega contagens reais de contacts/leads/deals/activities", async () => {
    const counts: Record<string, number> = { contacts: 5, leads: 3, deals: 2, activities: 10 };
    fromMock.mockImplementation((table: string) =>
      createCountQueryBuilder({ count: counts[table], error: null }),
    );

    const result = await SupabaseCrmAdapter.fetch("org-1", VALID_COMPANY_ID);

    expect(result.available).toBe(true);
    expect(result.recordCount).toBe(20);
    expect(result.context.contacts).toBe("5");
    expect(result.context.activities).toBe("10");
  });

  it("devolve available:false quando alguma tabela retorna erro, sem lançar", async () => {
    fromMock.mockImplementation((table: string) =>
      createCountQueryBuilder(
        table === "leads" ? { count: null, error: { message: "leads down" } } : { count: 1, error: null },
      ),
    );

    const result = await SupabaseCrmAdapter.fetch("org-1", VALID_COMPANY_ID);

    expect(result.available).toBe(false);
  });
});
