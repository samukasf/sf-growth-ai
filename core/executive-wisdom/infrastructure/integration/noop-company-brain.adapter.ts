import type {
  CompanyBrainPort,
  CompanyBrainWisdomSnapshot,
} from "../../application";
import type { ExecutiveWisdom } from "../../domain";

export class NoopCompanyBrainAdapter implements CompanyBrainPort {
  async notifyWisdomChange(wisdom: ExecutiveWisdom): Promise<void> {
    void wisdom;
  }

  async getWisdomSnapshot(companyId: string): Promise<CompanyBrainWisdomSnapshot | null> {
    void companyId;
    return null;
  }
}
