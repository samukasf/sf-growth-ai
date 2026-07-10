import type { CompanyBrain, CompanyBrainUpdateInput } from "./company-brain.types";

export interface CompanyBrainRepository {
  save(brain: CompanyBrain): Promise<CompanyBrain>;
  findById(id: string): Promise<CompanyBrain | null>;
  findByCompany(tenantId: string, companyId: string): Promise<CompanyBrain | null>;
  update(id: string, input: CompanyBrainUpdateInput): Promise<CompanyBrain | null>;
}

export class InMemoryCompanyBrainRepository implements CompanyBrainRepository {
  private readonly store = new Map<string, CompanyBrain>();
  private readonly companyIndex = new Map<string, string>();

  private companyKey(tenantId: string, companyId: string): string {
    return `${tenantId}:${companyId}`;
  }

  async save(brain: CompanyBrain): Promise<CompanyBrain> {
    this.store.set(brain.id, brain);
    this.companyIndex.set(this.companyKey(brain.tenantId, brain.companyId), brain.id);
    return brain;
  }

  async findById(id: string): Promise<CompanyBrain | null> {
    return this.store.get(id) ?? null;
  }

  async findByCompany(tenantId: string, companyId: string): Promise<CompanyBrain | null> {
    const id = this.companyIndex.get(this.companyKey(tenantId, companyId));
    if (!id) return null;
    return this.findById(id);
  }

  async update(id: string, input: CompanyBrainUpdateInput): Promise<CompanyBrain | null> {
    const existing = this.store.get(id);
    if (!existing) return null;

    const updated: CompanyBrain = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
      timeline: [
        ...existing.timeline,
        {
          id: `tl-update-${Date.now()}`,
          type: "update",
          title: "Company Brain atualizado",
          description: "Campos estruturais atualizados manualmente.",
          occurredAt: new Date().toISOString(),
        },
      ],
    };

    this.store.set(id, updated);
    return updated;
  }
}

let defaultRepository: CompanyBrainRepository | null = null;

export function getCompanyBrainRepository(): CompanyBrainRepository {
  if (!defaultRepository) {
    defaultRepository = new InMemoryCompanyBrainRepository();
  }
  return defaultRepository;
}

export function createCompanyBrainRepository(): CompanyBrainRepository {
  return new InMemoryCompanyBrainRepository();
}
