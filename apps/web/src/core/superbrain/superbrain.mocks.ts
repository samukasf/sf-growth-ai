import type { ContextFragment, ContextSourceProvider } from "../context/context.types";
import type { Memory } from "../memory/memory.types";
import type { MemoryRepository } from "../memory/memory.repository";
import type {
  CompanyBrainPort,
  CompanyBrainSnapshot,
  ExecutiveCouncilPort,
  ExecutiveCouncilSnapshot,
} from "../orchestrator/orchestrator.types";

export const DEMO_TENANT_ID = "tenant-demo";
export const DEMO_COMPANY_ID = "company-demo";
export const DEMO_USER_ID = "user-demo";
export const DEMO_COMPANY_NAME = "GrafGil Impressões";

const BASE_TIMESTAMP = "2026-07-10T12:00:00.000Z";

export const MOCK_MEMORIES: Memory[] = [
  {
    id: "mem-assessment-1",
    tenantId: DEMO_TENANT_ID,
    companyId: DEMO_COMPANY_ID,
    title: "Diagnóstico anterior",
    content: "Posicionamento de marca ainda não formalizado.",
    memoryType: "ASSESSMENT",
    importance: "CRITICAL",
    tags: ["marca", "posicionamento"],
    createdBy: "samuel",
    createdAt: BASE_TIMESTAMP,
    updatedAt: BASE_TIMESTAMP,
  },
  {
    id: "mem-financial-1",
    tenantId: DEMO_TENANT_ID,
    companyId: DEMO_COMPANY_ID,
    title: "Receita vs meta",
    content: "Receita −12% vs meta mensal de R$ 55.000.",
    memoryType: "FINANCIAL",
    importance: "HIGH",
    tags: ["receita", "financeiro"],
    createdBy: "samuel",
    createdAt: BASE_TIMESTAMP,
    updatedAt: BASE_TIMESTAMP,
  },
  {
    id: "mem-marketing-1",
    tenantId: DEMO_TENANT_ID,
    companyId: DEMO_COMPANY_ID,
    title: "Campanhas digitais",
    content: "Investimento em ads zerado desde 12/05.",
    memoryType: "MARKETING",
    importance: "HIGH",
    tags: ["marketing-digital", "ads"],
    createdBy: "samuel",
    createdAt: BASE_TIMESTAMP,
    updatedAt: BASE_TIMESTAMP,
  },
  {
    id: "mem-strategy-1",
    tenantId: DEMO_TENANT_ID,
    companyId: DEMO_COMPANY_ID,
    title: "Oportunidade identificada",
    content: "Potencial Growth Score +158 pontos com aceleração digital.",
    memoryType: "STRATEGY",
    importance: "HIGH",
    tags: ["growth-score", "digital"],
    createdBy: "samuel",
    createdAt: BASE_TIMESTAMP,
    updatedAt: BASE_TIMESTAMP,
  },
];

export const MOCK_COMPANY_BRAIN: CompanyBrainSnapshot = {
  tenantId: DEMO_TENANT_ID,
  companyId: DEMO_COMPANY_ID,
  companyName: DEMO_COMPANY_NAME,
  growthScore: 642,
  health: {
    brand: 58,
    sales: 45,
    digital: 38,
    operations: 72,
    financial: 65,
  },
  profile: {
    segment: "Gráfica e comunicação visual",
    employees: 18,
    inactiveCustomers: 340,
  },
  generatedAt: BASE_TIMESTAMP,
};

export const MOCK_EXECUTIVE_COUNCIL: ExecutiveCouncilSnapshot = {
  sessionId: "council-demo-1",
  tenantId: DEMO_TENANT_ID,
  companyId: DEMO_COMPANY_ID,
  topic: "analysis",
  opinions: [
    {
      executiveId: "cmo",
      role: "CMO — Sophia",
      opinion:
        "Marketing Digital concentra o maior gap — potencial de +80 pontos no score.",
    },
    {
      executiveId: "cfo",
      role: "CFO — Victor",
      opinion: "Financeiro saudável; margem preservada apesar da queda de volume.",
    },
    {
      executiveId: "coo",
      role: "COO — Lucas",
      opinion: "Operação pronta para absorver +20% de demanda sem contratação.",
    },
  ],
  consensus: true,
  summary: "Consenso: priorizar fundação de marca antes de escalar mídia paga.",
  generatedAt: BASE_TIMESTAMP,
};

export const MOCK_CONTEXT_FRAGMENTS: ContextFragment[] = [
  {
    id: "ctx-marketing-1",
    source: "MARKETING",
    title: "Canais digitais",
    content: "Canais operando a 42% da capacidade.",
    priority: "HIGH",
    tags: ["marketing"],
    timestamp: BASE_TIMESTAMP,
  },
  {
    id: "ctx-financial-1",
    source: "FINANCIAL",
    title: "Budget disponível",
    content: "Teto aprovado de R$ 800/mês para retargeting.",
    priority: "MEDIUM",
    tags: ["budget"],
    timestamp: BASE_TIMESTAMP,
  },
  {
    id: "ctx-clients-1",
    source: "CLIENTS",
    title: "Base inativa",
    content: "340 clientes inativos elegíveis para reativação.",
    priority: "HIGH",
    tags: ["clientes"],
    timestamp: BASE_TIMESTAMP,
  },
];

export function createMockMemoryRepository(
  memories: Memory[] = MOCK_MEMORIES,
): MemoryRepository {
  const store = new Map(memories.map((memory) => [memory.id, memory]));

  return {
    create: async (input) => {
      const memory: Memory = {
        id: `mem-${Date.now()}`,
        tenantId: input.tenantId,
        companyId: input.companyId,
        title: input.title,
        content: input.content,
        memoryType: input.memoryType,
        importance: input.importance,
        tags: input.tags ?? [],
        createdBy: input.createdBy,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.set(memory.id, memory);
      return memory;
    },
    update: async (id, input) => {
      const existing = store.get(id);
      if (!existing) return null;
      const updated = { ...existing, ...input, updatedAt: new Date().toISOString() };
      store.set(id, updated);
      return updated;
    },
    delete: async (id) => store.delete(id),
    findById: async (id) => store.get(id) ?? null,
    findByCompany: async (tenantId, companyId) =>
      [...store.values()].filter(
        (memory) => memory.tenantId === tenantId && memory.companyId === companyId,
      ),
    search: async (criteria) => {
      let results = [...store.values()].filter(
        (memory) =>
          memory.tenantId === criteria.tenantId && memory.companyId === criteria.companyId,
      );
      if (criteria.query) {
        const query = criteria.query.toLowerCase();
        results = results.filter(
          (memory) =>
            memory.title.toLowerCase().includes(query) ||
            memory.content.toLowerCase().includes(query) ||
            memory.tags.some((tag) => tag.toLowerCase().includes(query)),
        );
      }
      if (results.length === 0) {
        results = [...store.values()].filter(
          (memory) =>
            memory.tenantId === criteria.tenantId && memory.companyId === criteria.companyId,
        );
      }
      return results;
    },
  };
}

export function createMockContextProviders(
  fragments: ContextFragment[] = MOCK_CONTEXT_FRAGMENTS,
): ContextSourceProvider[] {
  const bySource = new Map<ContextFragment["source"], ContextFragment[]>();
  for (const fragment of fragments) {
    const group = bySource.get(fragment.source) ?? [];
    group.push(fragment);
    bySource.set(fragment.source, group);
  }

  return [...bySource.entries()].map(([source, sourceFragments]) => ({
    source,
    fetch: async () => sourceFragments,
  }));
}

export function createMockCompanyBrainPort(
  snapshot: CompanyBrainSnapshot = MOCK_COMPANY_BRAIN,
): CompanyBrainPort {
  return {
    loadSnapshot: async (tenantId, companyId) => ({
      ...snapshot,
      tenantId,
      companyId,
      generatedAt: new Date().toISOString(),
    }),
  };
}

export function createMockExecutiveCouncilPort(
  council: ExecutiveCouncilSnapshot = MOCK_EXECUTIVE_COUNCIL,
): ExecutiveCouncilPort {
  return {
    consult: async ({ tenantId, companyId, topic, query }) => ({
      ...council,
      tenantId,
      companyId,
      topic,
      summary: `${council.summary} (query: ${query})`,
      generatedAt: new Date().toISOString(),
    }),
  };
}
