import type { ExecutiveDomain, KnowledgeCategory, KnowledgeRecord } from "../entities";

export type ClassificationInput = {
  title: string;
  content: string;
  sourceOrigin?: string;
  tags?: string[];
};

export type ClassificationResult = {
  domain: ExecutiveDomain;
  category: KnowledgeCategory;
  suggestedTags: string[];
};

export interface KnowledgeClassifier {
  classify(input: ClassificationInput): ClassificationResult;
  classifyRecord(record: KnowledgeRecord): ClassificationResult;
}
