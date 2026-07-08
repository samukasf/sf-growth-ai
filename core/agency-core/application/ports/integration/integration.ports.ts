import type { ClientExecutiveStackProps } from "../../../domain";

export interface CompanyBrainPort {
  isAvailable(): boolean;
  provisionForClient(
    organizationId: string,
    agencyId: string,
    companyId: string,
  ): Promise<{ companyBrainId: string }>;
}

export interface EnterpriseBrainPort {
  isAvailable(): boolean;
  registerAgencyClient(
    organizationId: string,
    agencyId: string,
    companyId: string,
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

export interface ExecutiveCEOPort {
  isAvailable(): boolean;
  assignToClient(
    organizationId: string,
    companyId: string,
    executiveStack: ClientExecutiveStackProps,
  ): Promise<void>;
}

export interface ExecutiveCRMPort {
  isAvailable(): boolean;
  registerClientAccount(
    organizationId: string,
    agencyId: string,
    companyId: string,
    clientName: string,
  ): Promise<void>;
}

export interface BusinessCommunicationPort {
  isAvailable(): boolean;
  prepareClientChannels(
    organizationId: string,
    agencyId: string,
    companyId: string,
  ): Promise<void>;
}

export interface BusinessAutomationPort {
  isAvailable(): boolean;
  prepareClientAutomations(
    organizationId: string,
    agencyId: string,
    companyId: string,
  ): Promise<void>;
}

export interface SoftwareFactoryPort {
  isAvailable(): boolean;
  prepareClientWorkspace(
    organizationId: string,
    agencyId: string,
    companyId: string,
  ): Promise<void>;
}

export interface ExecutiveMemoryPort {
  isAvailable(): boolean;
  provisionMemory(
    organizationId: string,
    companyId: string,
    executiveStack: ClientExecutiveStackProps,
  ): Promise<void>;
}

export interface ExecutiveContextPort {
  isAvailable(): boolean;
  provisionContext(
    organizationId: string,
    companyId: string,
    executiveStack: ClientExecutiveStackProps,
  ): Promise<void>;
}

export interface ExecutiveTimelinePort {
  isAvailable(): boolean;
  provisionTimeline(
    organizationId: string,
    companyId: string,
    executiveStack: ClientExecutiveStackProps,
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
