import type { KnowledgeRelationType } from "../../domain";

export type LinkKnowledgeDto = {
  companyId: string;
  sourceRecordId: string;
  targetRecordId: string;
  relationType: KnowledgeRelationType;
  strength?: number;
};
