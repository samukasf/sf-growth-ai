export type KnowledgeCategory =
  | "question"
  | "answer"
  | "analysis"
  | "decision"
  | "recommendation"
  | "executed_action"
  | "result"
  | "feedback"
  | "learning";

export type KnowledgeOrigin =
  | "samuel-ai"
  | "executive-inbox"
  | "executive-brain"
  | "executive-ceo"
  | "executive-strategy"
  | "executive-recommendation"
  | "executive-monitoring"
  | "executive-forecast"
  | "executive-learning"
  | "executive-intelligence"
  | "executive-priority"
  | "manual"
  | "system";

export type KnowledgeEvaluation = "positive" | "neutral" | "negative" | null;

export type KnowledgeScores = {
  knowledgeScore: number;
  experienceScore: number;
  confidenceScore: number;
  reuseScore: number;
  qualityScore: number;
};

export type ExecutiveKnowledgeRecord = {
  id: string;
  companyId: string;
  userId: string;
  timestamp: string;
  category: KnowledgeCategory;
  origin: KnowledgeOrigin;
  context: string;
  title: string;
  content: string;
  involvedModules: string[];
  responsibleEngine: string;
  confidenceScore: number;
  reuseCount: number;
  evaluation: KnowledgeEvaluation;
  tags: string[];
  scores: KnowledgeScores;
};

export type ExecutiveKnowledgeState = {
  companyId: string;
  records: ExecutiveKnowledgeRecord[];
  updatedAt: string;
};

export type LearningEventType =
  | "new_decision"
  | "new_strategy"
  | "new_campaign"
  | "new_insight"
  | "new_recommendation"
  | "error_identified"
  | "problem_resolved"
  | "goal_achieved"
  | "inbox_action"
  | "conversation"
  | "knowledge_reused";

export type LearningEvent = {
  id: string;
  companyId: string;
  userId: string;
  timestamp: string;
  type: LearningEventType;
  title: string;
  description: string;
  knowledgeRecordId?: string;
  metadata?: Record<string, string>;
};

export type LearningEventsState = {
  companyId: string;
  events: LearningEvent[];
  updatedAt: string;
};

export type PlaybookEntryType =
  | "best_practice"
  | "winning_strategy"
  | "recurring_case"
  | "recurring_error"
  | "lesson_learned";

export type ExecutivePlaybookEntry = {
  id: string;
  companyId: string;
  type: PlaybookEntryType;
  title: string;
  description: string;
  context: string;
  tags: string[];
  knowledgeRecordIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type ExecutivePlaybook = {
  companyId: string;
  bestPractices: ExecutivePlaybookEntry[];
  winningStrategies: ExecutivePlaybookEntry[];
  recurringCases: ExecutivePlaybookEntry[];
  recurringErrors: ExecutivePlaybookEntry[];
  lessonsLearned: ExecutivePlaybookEntry[];
  updatedAt: string;
};

export type KnowledgeRetrievalInput = {
  companyId: string;
  query: string;
  categories?: KnowledgeCategory[];
  minConfidence?: number;
  limit?: number;
};

export type KnowledgeRetrievalResult = {
  query: string;
  records: ExecutiveKnowledgeRecord[];
  matchedCount: number;
  sufficient: boolean;
  aggregateConfidence: number;
  canAnswerFromKnowledge: boolean;
  requiresAiProvider: boolean;
  suggestedAnswer?: string;
};

export type CreateKnowledgeRecordInput = {
  companyId: string;
  userId?: string;
  category: KnowledgeCategory;
  origin: KnowledgeOrigin;
  context?: string;
  title: string;
  content: string;
  involvedModules?: string[];
  responsibleEngine: string;
  confidenceScore?: number;
  tags?: string[];
  evaluation?: KnowledgeEvaluation;
};
