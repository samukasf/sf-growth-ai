import { describe, expect, it, vi } from "vitest";
import type { ContextFragment, ContextSourceProvider } from "../context/context.types";
import type { Memory } from "../memory/memory.types";
import type { MemoryRepository } from "../memory/memory.repository";
import { MemoryService } from "../memory/memory.service";
import { ContextService } from "../context/context.service";
import {
  classifyQueryIntent,
  mergeExecutionContext,
  shouldConsultCouncil,
} from "./orchestrator.context";
import {
  createNoopCompanyBrainPort,
  createNoopExecutiveCouncilPort,
  executeOrchestratorPipeline,
} from "./orchestrator.pipeline";
import { createOrchestratorLogger } from "./orchestrator.logger";
import type {
  CompanyBrainPort,
  ExecutiveCouncilPort,
  ExecutionContext,
  UserMessage,
} from "./orchestrator.types";

function createMemory(overrides: Partial<Memory> = {}): Memory {
  return {
    id: "mem-1",
    tenantId: "tenant-1",
    companyId: "company-1",
    title: "Campanha pausada",
    content: "Meta ads pausados por budget",
    memoryType: "MARKETING",
    importance: "HIGH",
    tags: ["marketing"],
    createdBy: "system",
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
    ...overrides,
  };
}

function createInMemoryRepository(memories: Memory[] = []): MemoryRepository {
  const store = new Map(memories.map((m) => [m.id, m]));
  return {
    create: async (input) => {
      const memory = createMemory({
        id: `mem-${Date.now()}`,
        ...input,
        tags: input.tags ?? [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
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
        (m) => m.tenantId === tenantId && m.companyId === companyId,
      ),
    search: async (criteria) => {
      let results = [...store.values()].filter(
        (m) => m.tenantId === criteria.tenantId && m.companyId === criteria.companyId,
      );
      if (criteria.query) {
        const q = criteria.query.toLowerCase();
        results = results.filter(
          (m) =>
            m.title.toLowerCase().includes(q) ||
            m.content.toLowerCase().includes(q),
        );
      }
      return results;
    },
  };
}

function createContextProvider(
  source: ContextFragment["source"],
  fragments: ContextFragment[],
): ContextSourceProvider {
  return {
    source,
    fetch: async () => fragments,
  };
}

const baseMessage: UserMessage = {
  id: "msg-1",
  tenantId: "tenant-1",
  companyId: "company-1",
  userId: "user-1",
  content: "Quero vender mais",
  receivedAt: "2026-07-10T12:00:00.000Z",
};

describe("classifyQueryIntent", () => {
  it("classifies sales intent", () => {
    const result = classifyQueryIntent("Quero vender mais");
    expect(result.intent).toBe("sales");
    expect(result.confidence).toBeGreaterThanOrEqual(85);
  });

  it("classifies analysis intent and requires council", () => {
    const result = classifyQueryIntent("Analise minha empresa");
    expect(result.intent).toBe("analysis");
    expect(result.requiresCouncil).toBe(true);
  });

  it("classifies greetings as conversation without consulting the council", () => {
    const result = classifyQueryIntent("Olá, tudo bem?");

    expect(result).toEqual({
      intent: "conversation",
      confidence: 98,
      requiresCouncil: false,
    });
    expect(shouldConsultCouncil(result)).toBe(false);
  });

  it("classifies writing requests as creative conversation", () => {
    const result = classifyQueryIntent("Escreve um poema sobre o mar");

    expect(result.intent).toBe("creative");
    expect(result.requiresCouncil).toBe(false);
  });
});

describe("shouldConsultCouncil", () => {
  it("returns true for analysis intent", () => {
    expect(
      shouldConsultCouncil({
        intent: "analysis",
        confidence: 95,
        requiresCouncil: true,
      }),
    ).toBe(true);
  });

  it("returns false for high-confidence sales without council flag", () => {
    expect(
      shouldConsultCouncil({
        intent: "sales",
        confidence: 85,
        requiresCouncil: false,
      }),
    ).toBe(false);
  });
});

describe("mergeExecutionContext", () => {
  it("merges memory, context, brain and council fragments", () => {
    const execution: ExecutionContext = {
      message: baseMessage,
      intent: classifyQueryIntent(baseMessage.content),
      memoryResults: [{ memory: createMemory(), score: 1 }],
      memorySummary: null,
      contextOutput: null,
      companyBrain: {
        tenantId: "tenant-1",
        companyId: "company-1",
        companyName: "Acme",
        health: { sales: 45 },
        profile: {},
        generatedAt: "2026-07-10T12:00:00.000Z",
      },
      executiveCouncil: {
        sessionId: "c-1",
        tenantId: "tenant-1",
        companyId: "company-1",
        topic: "sales",
        opinions: [{ executiveId: "cmo", role: "CMO", opinion: "Investir em retargeting" }],
        consensus: true,
        summary: "Consenso parcial",
        generatedAt: "2026-07-10T12:00:00.000Z",
      },
      steps: [],
    };

    const merged = mergeExecutionContext(execution);
    expect(merged.mergedFragmentCount).toBeGreaterThanOrEqual(3);
  });
});

describe("executeOrchestratorPipeline", () => {
  it("runs all 7 pipeline steps successfully", async () => {
    const logger = createOrchestratorLogger();
    const memoryRepo = createInMemoryRepository([createMemory()]);
    const contextProviders = [
      createContextProvider("MARKETING", [
        {
          id: "frag-1",
          source: "MARKETING",
          title: "Canal Meta",
          content: "Subutilizado",
          priority: "HIGH",
          tags: ["meta"],
          timestamp: "2026-07-10T12:00:00.000Z",
        },
      ]),
    ];

    const response = await executeOrchestratorPipeline(baseMessage, {
      memoryService: new MemoryService(memoryRepo),
      contextService: new ContextService(contextProviders),
      companyBrain: createNoopCompanyBrainPort(),
      executiveCouncil: createNoopExecutiveCouncilPort(),
      logger,
    });

    expect(response.steps).toHaveLength(7);
    expect(response.steps.map((s) => s.name)).toEqual([
      "load_memory",
      "load_context",
      "load_company_brain",
      "load_executive_council",
      "merge_context",
      "build_runtime",
      "prepare_response",
    ]);

    const successfulSteps = response.steps.filter((s) => s.status === "success");
    expect(successfulSteps.length).toBeGreaterThanOrEqual(6);
    expect(response.intent.intent).toBe("sales");
    expect(response.runtime.llmPayload.userQuery).toBe("Quero vender mais");
    expect(response.generatedText).toBeNull();
    expect(response.confidence).toBeGreaterThan(0);
  });

  it("skips executive council for non-strategic intents", async () => {
    const councilConsult = vi.fn<ExecutiveCouncilPort["consult"]>();
    const executiveCouncil: ExecutiveCouncilPort = { consult: councilConsult };

    const response = await executeOrchestratorPipeline(baseMessage, {
      memoryService: new MemoryService(createInMemoryRepository()),
      contextService: new ContextService([]),
      companyBrain: createNoopCompanyBrainPort(),
      executiveCouncil,
      logger: createOrchestratorLogger(),
    });

    const councilStep = response.steps.find((s) => s.name === "load_executive_council");
    expect(councilStep?.status).toBe("skipped");
    expect(councilConsult).not.toHaveBeenCalled();
  });

  it("records structured logs with duration and status per step", async () => {
    const logger = createOrchestratorLogger();

    await executeOrchestratorPipeline(baseMessage, {
      memoryService: new MemoryService(createInMemoryRepository([createMemory()])),
      contextService: new ContextService([]),
      companyBrain: createNoopCompanyBrainPort(),
      executiveCouncil: createNoopExecutiveCouncilPort(),
      logger,
    });

    const entries = logger.getEntries();
    expect(entries.length).toBeGreaterThan(0);
    expect(entries.some((e) => e.step === "load_memory" && e.durationMs !== undefined)).toBe(
      true,
    );
    expect(entries.some((e) => e.status === "success")).toBe(true);
  });

  it("loads company brain snapshot into runtime", async () => {
    const brainLoad = vi.fn<CompanyBrainPort["loadSnapshot"]>().mockResolvedValue({
      tenantId: "tenant-1",
      companyId: "company-1",
      companyName: "GrafGil",
      growthScore: 700,
      health: { sales: 50, marketing: 60 },
      profile: { segment: "print" },
      generatedAt: "2026-07-10T12:00:00.000Z",
    });

    const response = await executeOrchestratorPipeline(baseMessage, {
      memoryService: new MemoryService(createInMemoryRepository()),
      contextService: new ContextService([]),
      companyBrain: { loadSnapshot: brainLoad },
      executiveCouncil: createNoopExecutiveCouncilPort(),
      logger: createOrchestratorLogger(),
    });

    expect(brainLoad).toHaveBeenCalledWith("tenant-1", "company-1");
    expect(response.runtime.companyBrain?.companyName).toBe("GrafGil");
    expect(response.diagnosis).toContain("Growth Score");
  });
});
