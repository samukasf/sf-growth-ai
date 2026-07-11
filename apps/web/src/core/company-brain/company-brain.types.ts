import type { RunDiscoveryResult } from "@/core/company-discovery";

export type DiscoveryResult = RunDiscoveryResult;

export type CompanyBrainId = string;

export type CompanyProfileSnapshot = {
  id: string;
  name: string;
  industry?: string;
  description?: string;
  completenessScore: number;
};

export type SwotAnalysis = {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
};

export type StatusSection = {
  summary: string;
  score: number;
  highlights: string[];
};

export type TimelineEntry = {
  id: string;
  date: string;
  label: string;
  description: string;
  source: "discovery" | "brain";
};

export type CompanyBrainScores = {
  knowledgeScore: number;
  completenessScore: number;
  confidenceScore: number;
};

export type CompanyBrain = {
  id: CompanyBrainId;
  organizationId: string;
  companyId: string;
  companyName: string;
  discoverySessionId: string;
  builtAt: string;
  updatedAt: string;
  companyProfile: CompanyProfileSnapshot;
  mission: string;
  vision: string;
  values: string[];
  products: string[];
  services: string[];
  targetAudience: string[];
  competitors: string[];
  swot: SwotAnalysis;
  marketingStatus: StatusSection;
  financialStatus: StatusSection;
  operationalStatus: StatusSection;
  digitalPresence: StatusSection;
  businessGoals: string[];
  openRisks: string[];
  growthOpportunities: string[];
  timeline: TimelineEntry[];
  knowledgeScore: number;
  completenessScore: number;
  confidenceScore: number;
};

export type CompanyBrainValidationIssue = {
  field: string;
  message: string;
  severity: "warning" | "error";
};

export type CompanyBrainValidationResult = {
  valid: boolean;
  issues: CompanyBrainValidationIssue[];
};

export type CompanyBrainExecutiveSummary = {
  headline: string;
  overview: string;
  keyInsights: string[];
  priorityActions: string[];
};

export type CompanyBrainPresentation = {
  executiveSummary: CompanyBrainExecutiveSummary;
  swot: SwotAnalysis;
  scores: CompanyBrainScores;
  timeline: TimelineEntry[];
  recommendations: string[];
  knowledge?: import("./knowledge/knowledge.types").KnowledgeGraphPresentation;
  health?: import("./health/health.types").HealthPresentation;
};

export type BuildCompanyBrainInput = {
  discovery: DiscoveryResult;
};

export type UpdateCompanyBrainInput = {
  brainId: CompanyBrainId;
  discovery?: DiscoveryResult;
  patch?: Partial<
    Pick<
      CompanyBrain,
      | "mission"
      | "vision"
      | "values"
      | "products"
      | "services"
      | "targetAudience"
      | "competitors"
      | "businessGoals"
      | "openRisks"
      | "growthOpportunities"
    >
  >;
};
