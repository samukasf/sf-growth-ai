import type { Assessment } from "../../../domain";

export interface EnterpriseBrainPort {
  isAvailable(): boolean;
  syncAssessmentScores(assessment: Assessment): Promise<void>;
}

export interface ExecutiveInnovationPort {
  isAvailable(): boolean;
  submitRecommendations(
    organizationId: string,
    companyId: string,
    recommendations: Record<string, unknown>[],
  ): Promise<void>;
}

export interface ExecutiveProjectsPort {
  isAvailable(): boolean;
  createProjectsFromRoadmap(
    organizationId: string,
    companyId: string,
    roadmap: Record<string, unknown>,
  ): Promise<void>;
}

export interface SoftwareFactoryPort {
  isAvailable(): boolean;
  evaluateSoftwareNeeds(
    organizationId: string,
    companyId: string,
    recommendations: Record<string, unknown>[],
  ): Promise<void>;
}

export interface ExecutiveCEOPort {
  isAvailable(): boolean;
  deliverExecutiveBriefing(
    organizationId: string,
    companyId: string,
    briefing: Record<string, unknown>,
  ): Promise<void>;
}
