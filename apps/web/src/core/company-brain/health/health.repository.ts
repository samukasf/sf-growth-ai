import type { CompanyHealth } from "./health.types";

export interface HealthRepository {
  save(health: CompanyHealth): Promise<void>;
  findLatestByCompany(companyId: string): Promise<CompanyHealth | null>;
  findHistoryByCompany(companyId: string, limit?: number): Promise<CompanyHealth[]>;
}

export class InMemoryHealthRepository implements HealthRepository {
  private readonly byCompany = new Map<string, CompanyHealth[]>();

  save(health: CompanyHealth): Promise<void> {
    const history = this.byCompany.get(health.companyId) ?? [];
    history.push(structuredClone(health));
    this.byCompany.set(health.companyId, history);
    return Promise.resolve();
  }

  findLatestByCompany(companyId: string): Promise<CompanyHealth | null> {
    const history = this.byCompany.get(companyId) ?? [];
    const latest = history.at(-1);
    return Promise.resolve(latest ? structuredClone(latest) : null);
  }

  findHistoryByCompany(companyId: string, limit = 10): Promise<CompanyHealth[]> {
    const history = this.byCompany.get(companyId) ?? [];
    return Promise.resolve(history.slice(-limit).map((item) => structuredClone(item)));
  }
}

let defaultRepository: InMemoryHealthRepository | null = null;

export function getDefaultHealthRepository(): InMemoryHealthRepository {
  if (!defaultRepository) {
    defaultRepository = new InMemoryHealthRepository();
  }
  return defaultRepository;
}
