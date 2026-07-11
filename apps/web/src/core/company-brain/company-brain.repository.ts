import type { CompanyBrain, CompanyBrainId } from "./company-brain.types";

export interface CompanyBrainRepository {
  save(brain: CompanyBrain): Promise<void>;
  findById(id: CompanyBrainId): Promise<CompanyBrain | null>;
  findByCompanyId(companyId: string): Promise<CompanyBrain | null>;
  list(): Promise<CompanyBrain[]>;
}

export class InMemoryCompanyBrainRepository implements CompanyBrainRepository {
  private readonly byId = new Map<CompanyBrainId, CompanyBrain>();
  private readonly byCompanyId = new Map<string, CompanyBrainId>();

  save(brain: CompanyBrain): Promise<void> {
    this.byId.set(brain.id, structuredClone(brain));
    this.byCompanyId.set(brain.companyId, brain.id);
    return Promise.resolve();
  }

  findById(id: CompanyBrainId): Promise<CompanyBrain | null> {
    const brain = this.byId.get(id);
    return Promise.resolve(brain ? structuredClone(brain) : null);
  }

  findByCompanyId(companyId: string): Promise<CompanyBrain | null> {
    const id = this.byCompanyId.get(companyId);
    if (!id) return Promise.resolve(null);
    return this.findById(id);
  }

  list(): Promise<CompanyBrain[]> {
    return Promise.resolve([...this.byId.values()].map((brain) => structuredClone(brain)));
  }
}

let defaultRepository: InMemoryCompanyBrainRepository | null = null;

export function getDefaultCompanyBrainRepository(): InMemoryCompanyBrainRepository {
  if (!defaultRepository) {
    defaultRepository = new InMemoryCompanyBrainRepository();
  }
  return defaultRepository;
}
