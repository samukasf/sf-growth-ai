import {
  ExecutiveBestPractice,
  ExecutiveBusinessRule,
  ExecutiveDecisionHistory,
  ExecutiveExperience,
  ExecutiveLesson,
  ExecutivePlaybook,
  ExecutiveRecommendationPattern,
  ExecutiveWisdom,
  type WisdomQuery,
  type WisdomRepository,
} from "../../domain";

function serializeWisdom(wisdom: ExecutiveWisdom): string {
  return JSON.stringify(wisdom.toJSON());
}

function deserializeWisdom(raw: string): ExecutiveWisdom {
  const parsed = JSON.parse(raw) as ReturnType<ExecutiveWisdom["toJSON"]>;
  return ExecutiveWisdom.create(parsed);
}

export class InMemoryWisdomRepository implements WisdomRepository {
  private readonly wisdomStore = new Map<string, string>();
  private readonly bestPractices: ExecutiveBestPractice[] = [];
  private readonly lessons: ExecutiveLesson[] = [];
  private readonly experiences: ExecutiveExperience[] = [];
  private readonly playbooks: ExecutivePlaybook[] = [];
  private readonly businessRules: ExecutiveBusinessRule[] = [];
  private readonly recommendationPatterns: ExecutiveRecommendationPattern[] = [];
  private readonly decisionHistory: ExecutiveDecisionHistory[] = [];

  async saveWisdom(wisdom: ExecutiveWisdom): Promise<void> {
    this.wisdomStore.set(wisdom.id, serializeWisdom(wisdom));
  }

  async findWisdomById(id: string): Promise<ExecutiveWisdom | null> {
    const raw = this.wisdomStore.get(id);
    return raw ? deserializeWisdom(raw) : null;
  }

  async findWisdomByCompany(companyId: string): Promise<ExecutiveWisdom[]> {
    const results: ExecutiveWisdom[] = [];

    for (const raw of this.wisdomStore.values()) {
      const wisdom = deserializeWisdom(raw);
      if (wisdom.companyId === companyId) {
        results.push(wisdom);
      }
    }

    return results.sort(
      (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
    );
  }

  async queryWisdom(filters: WisdomQuery): Promise<ExecutiveWisdom[]> {
    let results = await this.findWisdomByCompany(filters.companyId);

    if (filters.minConfidence !== undefined) {
      results = results.filter((item) => item.confidence >= filters.minConfidence!);
    }

    if (filters.minImportance !== undefined) {
      results = results.filter((item) => item.importance >= filters.minImportance!);
    }

    if (filters.risk) {
      results = results.filter((item) => item.risk === filters.risk);
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

  async deleteWisdom(id: string): Promise<void> {
    this.wisdomStore.delete(id);
  }

  async saveBestPractice(practice: ExecutiveBestPractice): Promise<void> {
    this.bestPractices.push(practice);
  }

  async saveLesson(lesson: ExecutiveLesson): Promise<void> {
    this.lessons.push(lesson);
  }

  async saveExperience(experience: ExecutiveExperience): Promise<void> {
    this.experiences.push(experience);
  }

  async savePlaybook(playbook: ExecutivePlaybook): Promise<void> {
    this.playbooks.push(playbook);
  }

  async saveBusinessRule(rule: ExecutiveBusinessRule): Promise<void> {
    this.businessRules.push(rule);
  }

  async saveRecommendationPattern(pattern: ExecutiveRecommendationPattern): Promise<void> {
    this.recommendationPatterns.push(pattern);
  }

  async saveDecisionHistory(history: ExecutiveDecisionHistory): Promise<void> {
    this.decisionHistory.push(history);
  }

  async findPlaybooksByCompany(companyId: string): Promise<ExecutivePlaybook[]> {
    return this.playbooks.filter((item) => item.companyId === companyId);
  }

  async findBusinessRulesByCompany(companyId: string): Promise<ExecutiveBusinessRule[]> {
    return this.businessRules.filter((item) => item.companyId === companyId);
  }

  async findRecommendationPatterns(
    companyId: string,
  ): Promise<ExecutiveRecommendationPattern[]> {
    return this.recommendationPatterns.filter((item) => item.companyId === companyId);
  }

  async findDecisionHistory(companyId: string): Promise<ExecutiveDecisionHistory[]> {
    return this.decisionHistory.filter((item) => item.companyId === companyId);
  }

  async findExperiencesByCompany(companyId: string): Promise<ExecutiveExperience[]> {
    return this.experiences.filter((item) => item.companyId === companyId);
  }
}
