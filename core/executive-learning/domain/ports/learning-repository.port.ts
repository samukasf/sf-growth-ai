import type { CompanyId, LearningRecordId } from "../../shared";
import type {
  LearningEvent,
  LearningExperience,
  LearningFeedback,
  LearningHypothesis,
  LearningPattern,
  LearningRecord,
} from "../entities";

export type LearningQuery = {
  companyId: CompanyId;
  knowledgeId?: string;
  decisionId?: string;
  minSuccessLevel?: number;
  minConfidence?: number;
  limit?: number;
};

export interface LearningRepository {
  saveRecord(record: LearningRecord): Promise<void>;
  findRecordById(id: LearningRecordId): Promise<LearningRecord | null>;
  findRecordsByCompany(companyId: CompanyId): Promise<LearningRecord[]>;
  queryRecords(filters: LearningQuery): Promise<LearningRecord[]>;
  deleteRecord(id: LearningRecordId): Promise<void>;
  saveEvent(event: LearningEvent): Promise<void>;
  findEventsByCompany(companyId: CompanyId): Promise<LearningEvent[]>;
  savePattern(pattern: LearningPattern): Promise<void>;
  findPatternsByCompany(companyId: CompanyId): Promise<LearningPattern[]>;
  saveExperience(experience: LearningExperience): Promise<void>;
  findExperiencesByRecord(recordId: LearningRecordId): Promise<LearningExperience[]>;
  saveFeedback(feedback: LearningFeedback): Promise<void>;
  saveHypothesis(hypothesis: LearningHypothesis): Promise<void>;
}
