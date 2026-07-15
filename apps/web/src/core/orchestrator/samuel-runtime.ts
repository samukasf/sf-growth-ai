import type { ContextFragment, ContextSourceProvider } from "../context";
import type { Memory, MemoryImportance, MemoryType } from "../memory";
import type { MemoryRepository } from "../memory/memory.repository";

import { OrchestratorService } from "./orchestrator.service";
import type {
  CompanyBrainPort,
  ExecutiveCouncilPort,
} from "./orchestrator.types";
import type {
  SamuelRuntimeCompanyInput,
  SamuelRuntimeInput,
  SamuelRuntimeResult,
} from "./samuel-runtime.types";

function normalizeImportance(value: unknown): MemoryImportance {
  if (typeof value === "number") {
    if (value >= 90) return "CRITICAL";
    if (value >= 70) return "HIGH";
    if (value >= 40) return "MEDIUM";
    return "LOW";
  }

  const normalized = String(value ?? "MEDIUM").toUpperCase();
  if (["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(normalized)) {
    return normalized as MemoryImportance;
  }
  return "MEDIUM";
}

function normalizeMemoryType(value: unknown): MemoryType {
  const normalized = String(value ?? "NOTE").toUpperCase();
  const knownTypes: MemoryType[] = [
    "NOTE",
    "CONVERSATION",
    "DOCUMENT",
    "CUSTOMER",
    "PROJECT",
    "TASK",
    "MEETING",
    "DISCOVERY",
    "ASSESSMENT",
    "MARKETING",
    "FINANCIAL",
    "STRATEGY",
  ];
  return knownTypes.includes(normalized as MemoryType)
    ? normalized as MemoryType
    : "NOTE";
}

function createMemoryRepository(
  input: SamuelRuntimeInput,
): MemoryRepository {
  const now = new Date().toISOString();
  const store = new Map<string, Memory>();

  for (const item of input.company.memories ?? []) {
    store.set(item.id, {
      id: item.id,
      tenantId: input.tenantId,
      companyId: input.companyId,
      title: item.title,
      content: item.content,
      memoryType: normalizeMemoryType(item.type),
      importance: normalizeImportance(item.importance),
      tags: item.tags ?? (item.source ? [item.source] : []),
      createdBy: item.source ?? "company-memory",
      createdAt: item.createdAt ?? now,
      updatedAt: item.createdAt ?? now,
    });
  }

  return {
    create: async (memoryInput) => {
      const timestamp = new Date().toISOString();
      const memory: Memory = {
        id: crypto.randomUUID(),
        ...memoryInput,
        tags: memoryInput.tags ?? [],
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      store.set(memory.id, memory);
      return memory;
    },
    update: async (id, update) => {
      const current = store.get(id);
      if (!current) return null;
      const next = { ...current, ...update, updatedAt: new Date().toISOString() };
      store.set(id, next);
      return next;
    },
    delete: async (id) => store.delete(id),
    findById: async (id) => store.get(id) ?? null,
    findByCompany: async (tenantId, companyId) =>
      [...store.values()].filter(
        (memory) =>
          memory.tenantId === tenantId && memory.companyId === companyId,
      ),
    search: async (criteria) =>
      [...store.values()].filter(
        (memory) =>
          memory.tenantId === criteria.tenantId &&
          memory.companyId === criteria.companyId,
      ),
  };
}

function createContextProviders(
  input: SamuelRuntimeInput,
): ContextSourceProvider[] {
  const timestamp = new Date().toISOString();
  const fragments: ContextFragment[] = [];

  if (input.company.summary) {
    fragments.push({
      id: `company-summary-${input.companyId}`,
      source: "COMPANY_BRAIN",
      title: `Contexto de ${input.company.name}`,
      content: input.company.summary,
      priority: "CRITICAL",
      tags: ["company-context"],
      timestamp,
    });
  }

  if (input.company.executiveSummary) {
    fragments.push({
      id: `executive-summary-${input.companyId}`,
      source: "COMPANY_BRAIN",
      title: "Síntese executiva atual",
      content: input.company.executiveSummary,
      priority: "HIGH",
      tags: ["executive-summary"],
      timestamp,
    });
  }

  if (input.company.topPriorities?.length) {
    fragments.push({
      id: `priorities-${input.companyId}`,
      source: "PROJECTS",
      title: "Prioridades executivas",
      content: input.company.topPriorities.join(" · "),
      priority: "HIGH",
      tags: ["priorities"],
      timestamp,
    });
  }

  if (input.company.nextActions?.length) {
    fragments.push({
      id: `next-actions-${input.companyId}`,
      source: "AGENDA",
      title: "Próximas ações",
      content: input.company.nextActions.join(" · "),
      priority: "HIGH",
      tags: ["actions"],
      timestamp,
    });
  }

  const bySource = new Map<ContextFragment["source"], ContextFragment[]>();
  for (const fragment of fragments) {
    const sourceFragments = bySource.get(fragment.source) ?? [];
    sourceFragments.push(fragment);
    bySource.set(fragment.source, sourceFragments);
  }

  return [...bySource.entries()].map(([source, sourceFragments]) => ({
    source,
    fetch: async () => sourceFragments,
  }));
}

function createCompanyBrainPort(
  company: SamuelRuntimeCompanyInput,
): CompanyBrainPort {
  return {
    async loadSnapshot(tenantId, companyId) {
      return {
        tenantId,
        companyId,
        companyName: company.name,
        growthScore: company.growthScore ?? undefined,
        health: company.health ?? {},
        profile: {
          industry: company.industry ?? null,
          location: company.location ?? null,
          ...company.profile,
        },
        generatedAt: new Date().toISOString(),
      };
    },
  };
}

function createExecutiveCouncilPort(
  company: SamuelRuntimeCompanyInput,
): ExecutiveCouncilPort {
  return {
    async consult({ tenantId, companyId, topic }) {
      if (!company.executiveRecommendation && !company.executiveSummary) {
        return null;
      }

      const opinion =
        company.executiveRecommendation ??
        company.executiveSummary ??
        "Sem recomendação executiva disponível.";

      return {
        sessionId: crypto.randomUUID(),
        tenantId,
        companyId,
        topic,
        opinions: [
          {
            executiveId: "current-executive-context",
            role: "Executive Runtime",
            opinion,
          },
        ],
        consensus: true,
        summary: company.topPriorities?.length
          ? `Prioridades atuais: ${company.topPriorities.join(" · ")}`
          : opinion,
        generatedAt: new Date().toISOString(),
      };
    },
  };
}

export async function runSamuelRuntime(
  input: SamuelRuntimeInput,
): Promise<SamuelRuntimeResult> {
  const service = new OrchestratorService({
    memoryRepository: createMemoryRepository(input),
    contextProviders: createContextProviders(input),
    companyBrain: createCompanyBrainPort(input.company),
    executiveCouncil: createExecutiveCouncilPort(input.company),
  });

  const response = await service.processMessage({
    tenantId: input.tenantId,
    companyId: input.companyId,
    userId: input.userId,
    content: input.query,
    sessionId: input.sessionId,
  });

  return {
    response,
    evidenceCount: response.runtime.mergedFragmentCount,
    generatedAt: new Date().toISOString(),
  };
}
