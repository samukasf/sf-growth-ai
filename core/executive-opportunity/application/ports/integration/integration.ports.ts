import type { BusinessOpportunity } from "../../../domain";

export interface EnterpriseBrainPort {
  isAvailable(): boolean;
  syncOpportunities(
    organizationId: string,
    companyId: string,
    opportunities: Record<string, unknown>[],
  ): Promise<void>;
}

export interface EnterpriseAssessmentPort {
  isAvailable(): boolean;
  getAssessmentScores(organizationId: string, companyId: string): Promise<Record<string, number>>;
}

export interface ExecutiveCEOPort {
  isAvailable(): boolean;
  deliverOpportunityBriefing(
    organizationId: string,
    companyId: string,
    briefing: Record<string, unknown>,
  ): Promise<void>;
}

export interface ExecutiveCouncilPort {
  isAvailable(): boolean;
  submitForCouncilReview(
    organizationId: string,
    companyId: string,
    opportunity: Record<string, unknown>,
  ): Promise<void>;
}

export interface ExecutiveProjectsPort {
  isAvailable(): boolean;
  createProjectFromOpportunity(
    organizationId: string,
    companyId: string,
    opportunity: Record<string, unknown>,
    executionPlan: Record<string, unknown>,
  ): Promise<void>;
}

export interface SoftwareFactoryPort {
  isAvailable(): boolean;
  evaluateSoftwareOpportunity(
    organizationId: string,
    companyId: string,
    opportunity: BusinessOpportunity,
  ): Promise<void>;
}

export interface BusinessAutomationPort {
  isAvailable(): boolean;
  evaluateAutomationOpportunity(
    organizationId: string,
    companyId: string,
    opportunity: BusinessOpportunity,
  ): Promise<void>;
}
