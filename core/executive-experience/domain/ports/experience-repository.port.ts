import type { CompanyId, ExperienceId } from "../../shared";
import type {
  BusinessCase,
  BusinessScenario,
  ExecutiveExperience,
  ExperiencePattern,
  ExecutionHistory,
  FailureCase,
  OperationalContext,
  SuccessCase,
} from "../entities";

export type ExperienceQuery = {
  companyId: CompanyId;
  minSuccessLevel?: number;
  minConfidence?: number;
  tags?: string[];
  scenario?: string;
  limit?: number;
};

export interface ExperienceRepository {
  saveExperience(experience: ExecutiveExperience): Promise<void>;
  findExperienceById(id: ExperienceId): Promise<ExecutiveExperience | null>;
  findExperiencesByCompany(companyId: CompanyId): Promise<ExecutiveExperience[]>;
  queryExperiences(filters: ExperienceQuery): Promise<ExecutiveExperience[]>;
  deleteExperience(id: ExperienceId): Promise<void>;
  saveExecutionHistory(history: ExecutionHistory): Promise<void>;
  saveScenario(scenario: BusinessScenario): Promise<void>;
  savePattern(pattern: ExperiencePattern): Promise<void>;
  findPatternsByCompany(companyId: CompanyId): Promise<ExperiencePattern[]>;
  saveOperationalContext(context: OperationalContext): Promise<void>;
}

export interface CaseRepository {
  saveBusinessCase(businessCase: BusinessCase): Promise<void>;
  findBusinessCaseById(id: string): Promise<BusinessCase | null>;
  findBusinessCasesByCompany(companyId: CompanyId): Promise<BusinessCase[]>;
  saveSuccessCase(successCase: SuccessCase): Promise<void>;
  findSuccessCasesByCompany(companyId: CompanyId): Promise<SuccessCase[]>;
  saveFailureCase(failureCase: FailureCase): Promise<void>;
  findFailureCasesByCompany(companyId: CompanyId): Promise<FailureCase[]>;
}
