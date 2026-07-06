import type { ExecutiveWisdom } from "../../../domain";

export type ExecutiveLearningReference = {
  companyId: string;
  learningIds: string[];
  wisdomId: string;
};

export interface ExecutiveLearningPort {
  linkWisdomToLearning(reference: ExecutiveLearningReference): Promise<void>;
  getRelatedLearningIds(wisdom: ExecutiveWisdom): Promise<string[]>;
}
