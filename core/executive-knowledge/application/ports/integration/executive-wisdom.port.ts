import type { KnowledgeRecord } from "../../../domain";

export type ExecutiveWisdomCandidate = {
  companyId: string;
  principle: string;
  derivedFromRecordIds: string[];
  confidence: number;
};

export interface ExecutiveWisdomPort {
  evaluateForWisdom(record: KnowledgeRecord): Promise<ExecutiveWisdomCandidate | null>;
  registerWisdomCandidate(candidate: ExecutiveWisdomCandidate): Promise<void>;
}
