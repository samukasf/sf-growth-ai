import type { SoftwareProject } from "../../../domain";

export interface ExecutiveProjectGeneratorPort {
  isAvailable(): boolean;
  notifySoftwareFactoryRequested(
    organizationId: string,
    companyId: string,
    project: SoftwareProject,
  ): Promise<void>;
}

export interface EnterpriseBrainPort {
  isAvailable(): boolean;
  syncSoftwareProjects(
    organizationId: string,
    companyId: string,
    projects: Record<string, unknown>[],
  ): Promise<void>;
}

export interface ExecutiveCEOPort {
  isAvailable(): boolean;
  deliverSoftwareBriefing(
    organizationId: string,
    companyId: string,
    briefing: Record<string, unknown>,
  ): Promise<void>;
}

export interface ExecutiveCouncilPort {
  isAvailable(): boolean;
  requestSoftwareApproval(
    organizationId: string,
    companyId: string,
    approval: Record<string, unknown>,
  ): Promise<void>;
}

export interface BusinessAutomationPlatformPort {
  isAvailable(): boolean;
  evaluateAutomationBlueprint(
    organizationId: string,
    companyId: string,
    project: SoftwareProject,
  ): Promise<void>;
}

export interface AIProviderLayerPort {
  isAvailable(): boolean;
  registerPlannedGeneration(
    organizationId: string,
    companyId: string,
    project: SoftwareProject,
  ): Promise<void>;
}

