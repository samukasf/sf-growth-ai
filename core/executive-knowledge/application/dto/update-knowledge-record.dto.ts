export type UpdateKnowledgeRecordDto = {
  recordId: string;
  title?: string;
  summary?: string;
  content?: string;
  confidence?: number;
  importance?: number;
  relevance?: number;
  tags?: string[];
  references?: string[];
};
