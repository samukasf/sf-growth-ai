export type ExecutiveContextField = {
  id: string;
  label: string;
  value: string;
};

export type ExecutiveContext = {
  companyId: string;
  companyName: string;
  segment: string;
  location: string;
  growthScore: number;
  detectedObjective: string;
  fields: ExecutiveContextField[];
};

export type MetricTrend = "up" | "down" | "stable";

export type ExecutiveMetric = {
  label: string;
  value: string;
  trend: MetricTrend;
  change: string;
};

export type ExecutiveBriefing = {
  greeting: string;
  companyName: string;
  last24hSummary: string;
  metrics: {
    revenue: ExecutiveMetric;
    growth: ExecutiveMetric;
    leads: ExecutiveMetric;
    conversions: ExecutiveMetric;
  };
  campaigns: string;
  competitors: string;
  market: string;
  dayPriority: string;
  currentRisk: string;
  opportunities: string[];
  nextRecommendation: string;
};

export type ExecutiveStatus = {
  online: boolean;
  monitoringCompany: boolean;
  businessTwinSynced: boolean;
  marketMonitored: boolean;
  lastAnalysis: string;
  autonomyLevel: string;
  analysisConfidence: number;
  nextUpdate: string;
};

export type CouncilMemberStatus = "online" | "consulting" | "standby" | "offline";

export type CouncilMemberAvailability = "available" | "busy" | "unavailable";

export type ExecutiveCouncilMember = {
  id: string;
  role: string;
  title: string;
  status: CouncilMemberStatus;
  lastConsulted: string;
  availability: CouncilMemberAvailability;
};

export type ExecutiveCouncil = {
  members: ExecutiveCouncilMember[];
};

export type StrategicMemoryEntry = {
  id: string;
  title: string;
  summary: string;
  date: string;
  outcome?: string;
};

export type ExecutiveMemory = {
  recentDecisions: StrategicMemoryEntry[];
  previousRecommendations: StrategicMemoryEntry[];
  results: StrategicMemoryEntry[];
  learnings: StrategicMemoryEntry[];
  relevantPatterns: string[];
};

export type ReasoningStepStatus = "completed" | "in_progress" | "pending";

export type ExecutiveReasoningStep = {
  id: string;
  order: number;
  title: string;
  description: string;
  status: ReasoningStepStatus;
  specialist?: string;
};

export type ConsultationSource = {
  id: string;
  label: string;
  status: ReasoningStepStatus;
};

export type ExecutiveReasoning = {
  steps: ExecutiveReasoningStep[];
  currentFocus: string;
  consultations: ConsultationSource[];
  executiveConsensus: string | null;
};

export type ActionPriority = "critical" | "high" | "medium" | "low";

export type ActionImpact = "high" | "medium" | "low";

export type ExecutiveAction = {
  id: string;
  priority: ActionPriority;
  title: string;
  description: string;
  expectedImpact: ActionImpact;
  impactDescription: string;
  nextStep: string;
  timeframe: string;
};

export type ExecutiveActionPlan = {
  summary: string;
  actions: ExecutiveAction[];
};

export type ExecutiveBrain = {
  id: string;
  builtAt: string;
  userQuery: string;
  context: ExecutiveContext;
  memory: ExecutiveMemory;
  reasoning: ExecutiveReasoning;
  actionPlan: ExecutiveActionPlan;
};

export type ExecutiveBrainStatus = "idle" | "building" | "ready";

export type CommandCenterState = {
  briefing: ExecutiveBriefing;
  status: ExecutiveStatus;
  council: ExecutiveCouncil;
  brain: ExecutiveBrain;
  brainStatus: ExecutiveBrainStatus;
  hasActiveAnalysis: boolean;
};
