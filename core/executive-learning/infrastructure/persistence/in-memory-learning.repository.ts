import {
  LearningEvent,
  LearningExperience,
  LearningFeedback,
  LearningHypothesis,
  LearningOutcome,
  LearningPattern,
  LearningRecord,
  type LearningQuery,
  type LearningRepository,
} from "../../domain";

type SerializedRecord = ReturnType<LearningRecord["toJSON"]> & {
  outcome: ReturnType<LearningOutcome["toJSON"]>;
};

function serializeRecord(record: LearningRecord): string {
  const json = record.toJSON();
  return JSON.stringify({
    ...json,
    outcome: record.outcome.toJSON(),
  });
}

function deserializeRecord(raw: string): LearningRecord {
  const parsed = JSON.parse(raw) as SerializedRecord;

  return LearningRecord.create({
    ...parsed,
    outcome: LearningOutcome.create(parsed.outcome),
  });
}

export class InMemoryLearningRepository implements LearningRepository {
  private readonly records = new Map<string, string>();
  private readonly events: LearningEvent[] = [];
  private readonly patterns: LearningPattern[] = [];
  private readonly experiences: LearningExperience[] = [];
  private readonly feedbacks: LearningFeedback[] = [];
  private readonly hypotheses: LearningHypothesis[] = [];

  async saveRecord(record: LearningRecord): Promise<void> {
    this.records.set(record.id, serializeRecord(record));
  }

  async findRecordById(id: string): Promise<LearningRecord | null> {
    const raw = this.records.get(id);
    return raw ? deserializeRecord(raw) : null;
  }

  async findRecordsByCompany(companyId: string): Promise<LearningRecord[]> {
    const results: LearningRecord[] = [];

    for (const raw of this.records.values()) {
      const record = deserializeRecord(raw);
      if (record.companyId === companyId) {
        results.push(record);
      }
    }

    return results.sort(
      (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
    );
  }

  async queryRecords(filters: LearningQuery): Promise<LearningRecord[]> {
    let results = await this.findRecordsByCompany(filters.companyId);

    if (filters.knowledgeId) {
      results = results.filter((record) => record.knowledgeId === filters.knowledgeId);
    }

    if (filters.decisionId) {
      results = results.filter((record) => record.decisionId === filters.decisionId);
    }

    if (filters.minSuccessLevel !== undefined) {
      results = results.filter((record) => record.successLevel >= filters.minSuccessLevel!);
    }

    if (filters.minConfidence !== undefined) {
      results = results.filter((record) => record.confidence >= filters.minConfidence!);
    }

    if (filters.limit !== undefined) {
      results = results.slice(0, filters.limit);
    }

    return results;
  }

  async deleteRecord(id: string): Promise<void> {
    this.records.delete(id);
  }

  async saveEvent(event: LearningEvent): Promise<void> {
    this.events.push(event);
  }

  async findEventsByCompany(companyId: string): Promise<LearningEvent[]> {
    return this.events.filter((event) => event.companyId === companyId);
  }

  async savePattern(pattern: LearningPattern): Promise<void> {
    this.patterns.push(pattern);
  }

  async findPatternsByCompany(companyId: string): Promise<LearningPattern[]> {
    return this.patterns.filter((pattern) => pattern.companyId === companyId);
  }

  async saveExperience(experience: LearningExperience): Promise<void> {
    this.experiences.push(experience);
  }

  async findExperiencesByRecord(recordId: string): Promise<LearningExperience[]> {
    return this.experiences.filter((experience) => experience.recordId === recordId);
  }

  async saveFeedback(feedback: LearningFeedback): Promise<void> {
    this.feedbacks.push(feedback);
  }

  async saveHypothesis(hypothesis: LearningHypothesis): Promise<void> {
    this.hypotheses.push(hypothesis);
  }
}
