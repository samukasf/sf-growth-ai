export interface AgencyCorePort {
  isAvailable(): boolean;
  notifyBusinessDayStarted(
    organizationId: string,
    agencyId: string,
    companyId: string,
  ): Promise<void>;
}

export interface ClientLifecyclePort {
  isAvailable(): boolean;
  syncBusinessDayEvent(
    organizationId: string,
    companyId: string,
    eventType: string,
  ): Promise<void>;
}

export interface CompanyBrainPort {
  isAvailable(): boolean;
  enrichDailyContext(
    organizationId: string,
    companyId: string,
    businessDayId: string,
  ): Promise<void>;
}

export interface EnterpriseBrainPort {
  isAvailable(): boolean;
  registerDailyOperations(
    organizationId: string,
    companyId: string,
    businessDayId: string,
  ): Promise<void>;
}

export interface ExecutiveCEOPort {
  isAvailable(): boolean;
  deliverDailyBriefing(
    organizationId: string,
    companyId: string,
    reviewSummary: Record<string, unknown>,
  ): Promise<void>;
}

export interface ExecutiveCouncilPort {
  isAvailable(): boolean;
  conveneDailyReview(
    organizationId: string,
    companyId: string,
    priorities: Record<string, unknown>[],
  ): Promise<void>;
}

export interface ExecutiveMissionsPort {
  isAvailable(): boolean;
  assignDailyMissions(
    organizationId: string,
    companyId: string,
    priorities: Record<string, unknown>[],
  ): Promise<void>;
}

export interface ExecutiveOpportunitiesPort {
  isAvailable(): boolean;
  scanDailyOpportunities(
    organizationId: string,
    companyId: string,
  ): Promise<void>;
}
