export type TimelineStepStatus =
  | "Waiting"
  | "Running"
  | "Completed"
  | "Warning"
  | "Error";

export type ExecutiveTimelineStepId =
  | "question-received"
  | "context-loaded"
  | "memory-consulted"
  | "executives-summoned"
  | "marketing-analyzing"
  | "finance-analyzing"
  | "sales-analyzing"
  | "operations-analyzing"
  | "watchers-consulted"
  | "executive-reasoning"
  | "executive-consensus"
  | "strategic-plan"
  | "recommendations"
  | "ceo-response";

export type ExecutiveTimelineStep = {
  id: ExecutiveTimelineStepId;
  order: number;
  title: string;
  description: string;
  status: TimelineStepStatus;
  timestamp: string | null;
  durationMs: number | null;
  confidence: number | null;
  responsible: string;
  detail?: string;
};

export type ExecutiveTimelineState = {
  steps: ExecutiveTimelineStep[];
  progressPercent: number;
  totalDurationMs: number | null;
  averageConfidence: number | null;
  isLive: boolean;
};
