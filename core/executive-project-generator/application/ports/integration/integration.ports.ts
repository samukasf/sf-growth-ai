import type { ExecutiveProject, ProjectOpportunity } from "../../../domain";
import type { ProjectApprovalRequest } from "../../../domain";

export interface EnterpriseBrainPort {
  isAvailable(): boolean;
  syncProjects(organizationId: string, companyId: string, projects: Record<string, unknown>[]): Promise<void>;
}

export interface ExecutiveOpportunityEnginePort {
  isAvailable(): boolean;
  getOpportunityById(organizationId: string, companyId: string, opportunityId: string): Promise<Record<string, unknown> | null>;
  notifyProjectGenerated(organizationId: string, companyId: string, project: ExecutiveProject): Promise<void>;
}

export interface ExecutiveMissionSystemPort {
  isAvailable(): boolean;
  getMissionFindings(organizationId: string, companyId: string): Promise<Record<string, unknown>[]>;
  notifyProjectGeneratedFromMission(organizationId: string, companyId: string, opportunity: ProjectOpportunity, project: ExecutiveProject): Promise<void>;
}

export interface ExecutiveCEOPort {
  isAvailable(): boolean;
  deliverProjectBriefing(organizationId: string, companyId: string, briefing: Record<string, unknown>): Promise<void>;
}

export interface ExecutiveCouncilPort {
  isAvailable(): boolean;
  requestApproval(organizationId: string, companyId: string, request: ProjectApprovalRequest): Promise<void>;
}

export interface BusinessAutomationPlatformPort {
  isAvailable(): boolean;
  evaluateAutomationProject(organizationId: string, companyId: string, project: ExecutiveProject): Promise<void>;
}

export interface SoftwareFactoryPort {
  isAvailable(): boolean;
  evaluateSoftwareProject(organizationId: string, companyId: string, project: ExecutiveProject): Promise<void>;
}

