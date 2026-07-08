import type { TenantExecutiveStackProps } from "../../../domain";

export interface AgencyCorePort {
  isAvailable(): boolean;
  registerTenantClient(
    organizationId: string,
    agencyId: string,
    companyId: string,
    tenantName: string,
  ): Promise<void>;
}

export interface EnterpriseBrainPort {
  isAvailable(): boolean;
  registerTenant(
    organizationId: string,
    agencyId: string,
    tenantId: string,
    companyId: string,
  ): Promise<void>;
}

export interface ExecutiveCEOPort {
  isAvailable(): boolean;
  assignToTenant(
    organizationId: string,
    tenantId: string,
    executiveStack: TenantExecutiveStackProps,
  ): Promise<void>;
}

export interface ExecutiveOrchestratorPort {
  isAvailable(): boolean;
  provisionTenantStack(
    organizationId: string,
    tenantId: string,
    executiveStack: TenantExecutiveStackProps,
  ): Promise<void>;
}

export interface BusinessCommunicationPort {
  isAvailable(): boolean;
  prepareTenantChannels(
    organizationId: string,
    agencyId: string,
    tenantId: string,
  ): Promise<void>;
}

export interface BusinessAutomationPort {
  isAvailable(): boolean;
  prepareTenantAutomations(
    organizationId: string,
    agencyId: string,
    tenantId: string,
  ): Promise<void>;
}

export interface SoftwareFactoryPort {
  isAvailable(): boolean;
  prepareTenantWorkspace(
    organizationId: string,
    agencyId: string,
    tenantId: string,
  ): Promise<void>;
}

export interface CompanyBrainPort {
  isAvailable(): boolean;
  provisionForTenant(
    organizationId: string,
    agencyId: string,
    tenantId: string,
    companyId: string,
  ): Promise<{ companyBrainId: string }>;
}

export interface ExecutiveMemoryPort {
  isAvailable(): boolean;
  provisionForTenant(
    organizationId: string,
    tenantId: string,
    executiveStack: TenantExecutiveStackProps,
  ): Promise<void>;
}

export interface ExecutiveCouncilPort {
  isAvailable(): boolean;
  provisionForTenant(
    organizationId: string,
    tenantId: string,
    executiveStack: TenantExecutiveStackProps,
  ): Promise<void>;
}

export interface ExecutiveTimelinePort {
  isAvailable(): boolean;
  provisionForTenant(
    organizationId: string,
    tenantId: string,
    executiveStack: TenantExecutiveStackProps,
  ): Promise<void>;
}

export interface ExecutiveDashboardPort {
  isAvailable(): boolean;
  provisionForTenant(
    organizationId: string,
    tenantId: string,
    executiveStack: TenantExecutiveStackProps,
  ): Promise<void>;
}

export interface ExecutiveMissionsPort {
  isAvailable(): boolean;
  provisionForTenant(
    organizationId: string,
    tenantId: string,
    executiveStack: TenantExecutiveStackProps,
  ): Promise<void>;
}

export interface ExecutiveOpportunitiesPort {
  isAvailable(): boolean;
  provisionForTenant(
    organizationId: string,
    tenantId: string,
    executiveStack: TenantExecutiveStackProps,
  ): Promise<void>;
}

export interface ExecutiveProjectsPort {
  isAvailable(): boolean;
  provisionForTenant(
    organizationId: string,
    tenantId: string,
    executiveStack: TenantExecutiveStackProps,
  ): Promise<void>;
}
