import type { DiscoveryResult, DiscoverySwotItem } from "../discovery/discovery.types";

export interface CompanyProfile {
  companyName: string;
  website: string;
  industry: string;
  location: string;
  socialNetworks: DiscoveryResult["socialNetworks"];
}

export interface CompanyBrainSwot {
  strengths: DiscoverySwotItem[];
  weaknesses: DiscoverySwotItem[];
  opportunities: DiscoverySwotItem[];
  risks: DiscoverySwotItem[];
}

export interface StatusArea {
  score: number;
  label: string;
  summary: string;
  indicators: string[];
}

export interface CompanyBrainTimelineEvent {
  id: string;
  type: "discovery" | "build" | "update" | "assessment";
  title: string;
  description: string;
  occurredAt: string;
}

export interface CompanyBrainScores {
  knowledgeScore: number;
  completenessScore: number;
  confidenceScore: number;
}

export interface CompanyBrain {
  id: string;
  tenantId: string;
  companyId: string;
  discoveryId: string;

  profile: CompanyProfile;
  mission: string;
  vision: string;
  values: string[];
  products: string[];
  services: string[];
  targetAudience: string[];
  competitors: string[];
  swot: CompanyBrainSwot;
  marketingStatus: StatusArea;
  financialStatus: StatusArea;
  operationalStatus: StatusArea;
  digitalPresence: StatusArea;
  businessGoals: string[];
  openRisks: string[];
  growthOpportunities: string[];
  timeline: CompanyBrainTimelineEvent[];

  knowledgeScore: number;
  completenessScore: number;
  confidenceScore: number;

  executiveSummary: string;
  recommendations: string[];

  createdAt: string;
  updatedAt: string;
}

export interface CompanyBrainBuildInput {
  discoveryResult: DiscoveryResult;
  tenantId?: string;
  companyId?: string;
}

export interface CompanyBrainUpdateInput {
  mission?: string;
  vision?: string;
  values?: string[];
  products?: string[];
  services?: string[];
  targetAudience?: string[];
  competitors?: string[];
  businessGoals?: string[];
}

export interface CompanyBrainValidationIssue {
  field: string;
  message: string;
  severity: "error" | "warning";
}

export interface CompanyBrainValidationResult {
  valid: boolean;
  issues: CompanyBrainValidationIssue[];
}

export interface CompanyBrainSummary {
  headline: string;
  executiveSummary: string;
  highlights: string[];
  missingAreas: string[];
  scoreOverview: CompanyBrainScores;
}

export interface CompanyBrainBuildResponse {
  companyBrain: CompanyBrain;
  summary: CompanyBrainSummary;
  validation: CompanyBrainValidationResult;
}
