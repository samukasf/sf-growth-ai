import type { CompanyId, WisdomId } from "../../shared";
import type {
  ExecutiveBestPractice,
  ExecutiveBusinessRule,
  ExecutiveDecisionHistory,
  ExecutiveExperience,
  ExecutiveLesson,
  ExecutivePlaybook,
  ExecutiveRecommendationPattern,
  ExecutiveWisdom,
} from "../entities";

export type WisdomQuery = {
  companyId: CompanyId;
  minConfidence?: number;
  minImportance?: number;
  risk?: string;
  tags?: string[];
  limit?: number;
};

export interface WisdomRepository {
  saveWisdom(wisdom: ExecutiveWisdom): Promise<void>;
  findWisdomById(id: WisdomId): Promise<ExecutiveWisdom | null>;
  findWisdomByCompany(companyId: CompanyId): Promise<ExecutiveWisdom[]>;
  queryWisdom(filters: WisdomQuery): Promise<ExecutiveWisdom[]>;
  deleteWisdom(id: WisdomId): Promise<void>;
  saveBestPractice(practice: ExecutiveBestPractice): Promise<void>;
  saveLesson(lesson: ExecutiveLesson): Promise<void>;
  saveExperience(experience: ExecutiveExperience): Promise<void>;
  savePlaybook(playbook: ExecutivePlaybook): Promise<void>;
  saveBusinessRule(rule: ExecutiveBusinessRule): Promise<void>;
  saveRecommendationPattern(pattern: ExecutiveRecommendationPattern): Promise<void>;
  saveDecisionHistory(history: ExecutiveDecisionHistory): Promise<void>;
  findPlaybooksByCompany(companyId: CompanyId): Promise<ExecutivePlaybook[]>;
  findBusinessRulesByCompany(companyId: CompanyId): Promise<ExecutiveBusinessRule[]>;
  findRecommendationPatterns(companyId: CompanyId): Promise<ExecutiveRecommendationPattern[]>;
  findDecisionHistory(companyId: CompanyId): Promise<ExecutiveDecisionHistory[]>;
  findExperiencesByCompany(companyId: CompanyId): Promise<ExecutiveExperience[]>;
}
