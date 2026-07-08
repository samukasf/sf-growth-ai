import type { ClientExecutiveStackProps } from "../../../domain";

export interface AgencyCorePort {
  isAvailable(): boolean;
  registerClient(
    organizationId: string,
    agencyId: string,
    companyId: string,
    clientName: string,
  ): Promise<void>;
}

export interface CompanyBrainPort {
  isAvailable(): boolean;
  activate(
    organizationId: string,
    agencyId: string,
    companyId: string,
    executiveStack: ClientExecutiveStackProps,
  ): Promise<{ companyBrainId: string }>;
}

export interface ExecutiveCEOPort {
  isAvailable(): boolean;
  assignToClient(
    organizationId: string,
    companyId: string,
    executiveStack: ClientExecutiveStackProps,
  ): Promise<void>;
}

export interface ExecutiveCouncilPort {
  isAvailable(): boolean;
  provisionCouncil(
    organizationId: string,
    companyId: string,
    executiveStack: ClientExecutiveStackProps,
  ): Promise<void>;
}

export interface ExecutiveCRMPort {
  isAvailable(): boolean;
  syncLead(
    organizationId: string,
    agencyId: string,
    leadId: string,
    name: string,
  ): Promise<void>;
  syncProposalAccepted(
    organizationId: string,
    agencyId: string,
    companyId: string,
    proposalId: string,
  ): Promise<void>;
}

export interface BusinessCommunicationPort {
  isAvailable(): boolean;
  notifyClientEvent(
    organizationId: string,
    agencyId: string,
    companyId: string,
    eventType: string,
  ): Promise<void>;
}

export interface BusinessAutomationPort {
  isAvailable(): boolean;
  triggerLifecycleAutomation(
    organizationId: string,
    agencyId: string,
    companyId: string,
    eventType: string,
  ): Promise<void>;
}

export interface ExecutiveMemoryPort {
  isAvailable(): boolean;
  provisionMemory(
    organizationId: string,
    companyId: string,
    executiveStack: ClientExecutiveStackProps,
  ): Promise<void>;
  recordEvent(
    organizationId: string,
    companyId: string,
    eventType: string,
    payload: Record<string, unknown>,
  ): Promise<void>;
}

export interface ExecutiveTimelinePort {
  isAvailable(): boolean;
  provisionTimeline(
    organizationId: string,
    companyId: string,
    executiveStack: ClientExecutiveStackProps,
  ): Promise<void>;
  appendEntry(
    organizationId: string,
    companyId: string,
    title: string,
    description: string,
  ): Promise<void>;
}

export interface ExecutiveDashboardPort {
  isAvailable(): boolean;
  provisionDashboard(
    organizationId: string,
    companyId: string,
    executiveStack: ClientExecutiveStackProps,
  ): Promise<void>;
}

export interface ExecutiveMissionsPort {
  isAvailable(): boolean;
  provisionMissions(
    organizationId: string,
    companyId: string,
    executiveStack: ClientExecutiveStackProps,
  ): Promise<void>;
}
