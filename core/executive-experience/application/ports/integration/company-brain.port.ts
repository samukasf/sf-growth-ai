import type { ExecutiveExperience } from "../../../domain";

export type CompanyBrainExperienceSnapshot = {
  companyId: string;
  experienceCount: number;
  averageSuccessLevel: number;
  lastUpdatedAt: string;
};

export interface CompanyBrainPort {
  notifyExperienceChange(experience: ExecutiveExperience): Promise<void>;
  getExperienceSnapshot(companyId: string): Promise<CompanyBrainExperienceSnapshot | null>;
}
