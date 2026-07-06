import {
  BusinessCase,
  BusinessScenario,
  ExecutiveExperience,
  ExecutionHistory,
  ExperiencePattern,
  FailureCase,
  OperationalContext,
  SuccessCase,
  type CaseRepository,
  type ExperienceQuery,
  type ExperienceRepository,
} from "../../domain";

function serializeExperience(experience: ExecutiveExperience): string {
  return JSON.stringify(experience.toJSON());
}

function deserializeExperience(raw: string): ExecutiveExperience {
  const parsed = JSON.parse(raw) as ReturnType<ExecutiveExperience["toJSON"]>;
  return ExecutiveExperience.create(parsed);
}

export class InMemoryExperienceRepository implements ExperienceRepository {
  private readonly store = new Map<string, string>();
  private readonly executionHistory: ExecutionHistory[] = [];
  private readonly scenarios: BusinessScenario[] = [];
  private readonly patterns: ExperiencePattern[] = [];
  private readonly contexts: OperationalContext[] = [];

  async saveExperience(experience: ExecutiveExperience): Promise<void> {
    this.store.set(experience.id, serializeExperience(experience));
  }

  async findExperienceById(id: string): Promise<ExecutiveExperience | null> {
    const raw = this.store.get(id);
    return raw ? deserializeExperience(raw) : null;
  }

  async findExperiencesByCompany(companyId: string): Promise<ExecutiveExperience[]> {
    const results: ExecutiveExperience[] = [];

    for (const raw of this.store.values()) {
      const experience = deserializeExperience(raw);
      if (experience.companyId === companyId) results.push(experience);
    }

    return results.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }

  async queryExperiences(filters: ExperienceQuery): Promise<ExecutiveExperience[]> {
    let results = await this.findExperiencesByCompany(filters.companyId);

    if (filters.minSuccessLevel !== undefined) {
      results = results.filter((item) => item.successLevel >= filters.minSuccessLevel!);
    }
    if (filters.minConfidence !== undefined) {
      results = results.filter((item) => item.confidence >= filters.minConfidence!);
    }
    if (filters.scenario) {
      results = results.filter((item) => item.scenario === filters.scenario);
    }
    if (filters.tags?.length) {
      results = results.filter((item) =>
        filters.tags!.some((tag) => item.tags.includes(tag)),
      );
    }
    if (filters.limit !== undefined) {
      results = results.slice(0, filters.limit);
    }

    return results;
  }

  async deleteExperience(id: string): Promise<void> {
    this.store.delete(id);
  }

  async saveExecutionHistory(history: ExecutionHistory): Promise<void> {
    this.executionHistory.push(history);
  }

  async saveScenario(scenario: BusinessScenario): Promise<void> {
    this.scenarios.push(scenario);
  }

  async savePattern(pattern: ExperiencePattern): Promise<void> {
    this.patterns.push(pattern);
  }

  async findPatternsByCompany(companyId: string): Promise<ExperiencePattern[]> {
    return this.patterns.filter((item) => item.companyId === companyId);
  }

  async saveOperationalContext(context: OperationalContext): Promise<void> {
    this.contexts.push(context);
  }
}

export class InMemoryCaseRepository implements CaseRepository {
  private readonly businessCases: BusinessCase[] = [];
  private readonly successCases: SuccessCase[] = [];
  private readonly failureCases: FailureCase[] = [];

  async saveBusinessCase(businessCase: BusinessCase): Promise<void> {
    this.businessCases.push(businessCase);
  }

  async findBusinessCaseById(id: string): Promise<BusinessCase | null> {
    return this.businessCases.find((item) => item.id === id) ?? null;
  }

  async findBusinessCasesByCompany(companyId: string): Promise<BusinessCase[]> {
    return this.businessCases.filter((item) => item.companyId === companyId);
  }

  async saveSuccessCase(successCase: SuccessCase): Promise<void> {
    this.successCases.push(successCase);
  }

  async findSuccessCasesByCompany(companyId: string): Promise<SuccessCase[]> {
    return this.successCases.filter((item) => item.companyId === companyId);
  }

  async saveFailureCase(failureCase: FailureCase): Promise<void> {
    this.failureCases.push(failureCase);
  }

  async findFailureCasesByCompany(companyId: string): Promise<FailureCase[]> {
    return this.failureCases.filter((item) => item.companyId === companyId);
  }
}
