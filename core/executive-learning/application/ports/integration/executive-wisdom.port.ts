import type { LearningPattern, LearningRecord } from "../../../domain";

export type ExecutiveWisdomCandidate = {
  companyId: string;
  principle: string;
  derivedFromRecordIds: string[];
  confidence: number;
};

export interface ExecutiveWisdomPort {
  evaluateForWisdom(record: LearningRecord): Promise<ExecutiveWisdomCandidate | null>;
  registerWisdomCandidate(candidate: ExecutiveWisdomCandidate): Promise<void>;
  registerFromPattern(pattern: LearningPattern): Promise<void>;
}
