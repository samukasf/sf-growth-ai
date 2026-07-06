import type { ExecutiveWisdom } from "../../../domain";

export type CompanyBrainWisdomSnapshot = {
  companyId: string;
  wisdomCount: number;
  averageConfidence: number;
  lastUpdatedAt: string;
};

export interface CompanyBrainPort {
  notifyWisdomChange(wisdom: ExecutiveWisdom): Promise<void>;
  getWisdomSnapshot(companyId: string): Promise<CompanyBrainWisdomSnapshot | null>;
}
