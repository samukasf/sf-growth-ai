export type OrchestratorBrainDomainSummary = {
  domain: string;
  headline: string;
  highlights: string[];
  recordCount: number;
  healthScore: number;
  lastUpdatedAt: string;
};

export type OrchestratorBrainSignalView = {
  id: string;
  type: string;
  title: string;
  description: string;
  source: string;
  severity: number;
  createdAt: string;
};

export type OrchestratorBrainSnapshot = {
  id: string;
  organizationId: string;
  companyId: string;
  timestamp: string;
  businessContext: Record<string, string>;
  memorySummary: OrchestratorBrainDomainSummary;
  knowledgeSummary: OrchestratorBrainDomainSummary;
  learningSummary: OrchestratorBrainDomainSummary;
  experienceSummary: OrchestratorBrainDomainSummary;
  wisdomSummary: OrchestratorBrainDomainSummary;
  organizationSummary: OrchestratorBrainDomainSummary;
  activeSignals: OrchestratorBrainSignalView[];
  risks: string[];
  opportunities: string[];
  priorities: string[];
  confidence: number;
};

export type OrchestratorBrainContext = {
  id: string;
  organizationId: string;
  companyId: string;
  businessContext: Record<string, string>;
  domainContexts: Record<string, Record<string, string>>;
  assembledAt: string;
};

export type OrchestratorRoutingContext = {
  snapshot: OrchestratorBrainSnapshot;
  brainContext: OrchestratorBrainContext;
};
