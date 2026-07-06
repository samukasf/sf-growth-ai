import type {
  CompanyBrainExperienceSnapshot,
  CompanyBrainPort,
} from "../../application";
import type { ExecutiveExperience } from "../../domain";

export class NoopCompanyBrainAdapter implements CompanyBrainPort {
  async notifyExperienceChange(experience: ExecutiveExperience): Promise<void> {
    void experience;
  }

  async getExperienceSnapshot(companyId: string): Promise<CompanyBrainExperienceSnapshot | null> {
    void companyId;
    return null;
  }
}
