import type { CompanyProfile } from "../../../domain";

export interface EnterpriseBrainPort {
  isAvailable(): boolean;
  syncProfile(profile: CompanyProfile): Promise<void>;
}

export interface OrganizationBrainPort {
  isAvailable(): boolean;
  registerOrganization(organizationId: string, companyId: string): Promise<void>;
}

export interface ExecutiveMemoryPort {
  isAvailable(): boolean;
  storeDiscoveryInsights(
    organizationId: string,
    companyId: string,
    insights: Record<string, unknown>,
  ): Promise<void>;
}

export interface ExecutiveKnowledgePort {
  isAvailable(): boolean;
  ingestProfile(profile: CompanyProfile): Promise<void>;
}

export interface ExecutiveInnovationPort {
  isAvailable(): boolean;
  submitOpportunities(
    organizationId: string,
    companyId: string,
    opportunities: Record<string, unknown>[],
  ): Promise<void>;
}

export interface ExecutiveProjectGeneratorPort {
  isAvailable(): boolean;
  generateFromGaps(
    organizationId: string,
    companyId: string,
    gaps: Record<string, unknown>[],
  ): Promise<void>;
}
