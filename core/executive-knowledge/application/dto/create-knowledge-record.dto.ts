import type { ExecutiveDomain, KnowledgeCategoryKind, KnowledgeSourceType } from "../../domain";

export type CreateKnowledgeRecordDto = {
  companyId: string;
  sourceType: KnowledgeSourceType;
  sourceOrigin: string;
  sourceReferenceId?: string;
  domain: ExecutiveDomain;
  categoryKind: KnowledgeCategoryKind;
  categoryLabel: string;
  title: string;
  summary: string;
  content: string;
  confidence?: number;
  importance?: number;
  relevance?: number;
  tags?: string[];
  references?: string[];
  involvedModules?: string[];
  responsibleEngine?: string;
  userId?: string;
};
