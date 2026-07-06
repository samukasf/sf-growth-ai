import type { ExecutiveWisdom } from "../../../domain";

export type ExecutiveKnowledgeReference = {
  companyId: string;
  knowledgeIds: string[];
  wisdomId: string;
};

export interface ExecutiveKnowledgePort {
  linkWisdomToKnowledge(reference: ExecutiveKnowledgeReference): Promise<void>;
  getRelatedKnowledgeIds(wisdom: ExecutiveWisdom): Promise<string[]>;
}
