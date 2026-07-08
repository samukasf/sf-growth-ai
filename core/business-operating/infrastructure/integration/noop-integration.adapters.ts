import type {
  AgencyCorePort,
  ClientLifecyclePort,
  CompanyBrainPort,
  EnterpriseBrainPort,
  ExecutiveCEOPort,
  ExecutiveCouncilPort,
  ExecutiveMissionsPort,
  ExecutiveOpportunitiesPort,
} from "../../application/ports/integration";

export class NoopAgencyCoreAdapter implements AgencyCorePort {
  isAvailable() {
    return false;
  }
  async notifyBusinessDayStarted(
    _organizationId: string,
    _agencyId: string,
    _companyId: string,
  ) {}
}

export class NoopClientLifecycleAdapter implements ClientLifecyclePort {
  isAvailable() {
    return false;
  }
  async syncBusinessDayEvent(
    _organizationId: string,
    _companyId: string,
    _eventType: string,
  ) {}
}

export class NoopCompanyBrainAdapter implements CompanyBrainPort {
  isAvailable() {
    return false;
  }
  async enrichDailyContext(
    _organizationId: string,
    _companyId: string,
    _businessDayId: string,
  ) {}
}

export class NoopEnterpriseBrainAdapter implements EnterpriseBrainPort {
  isAvailable() {
    return false;
  }
  async registerDailyOperations(
    _organizationId: string,
    _companyId: string,
    _businessDayId: string,
  ) {}
}

export class NoopExecutiveCEOAdapter implements ExecutiveCEOPort {
  isAvailable() {
    return false;
  }
  async deliverDailyBriefing(
    _organizationId: string,
    _companyId: string,
    _reviewSummary: Record<string, unknown>,
  ) {}
}

export class NoopExecutiveCouncilAdapter implements ExecutiveCouncilPort {
  isAvailable() {
    return false;
  }
  async conveneDailyReview(
    _organizationId: string,
    _companyId: string,
    _priorities: Record<string, unknown>[],
  ) {}
}

export class NoopExecutiveMissionsAdapter implements ExecutiveMissionsPort {
  isAvailable() {
    return false;
  }
  async assignDailyMissions(
    _organizationId: string,
    _companyId: string,
    _priorities: Record<string, unknown>[],
  ) {}
}

export class NoopExecutiveOpportunitiesAdapter implements ExecutiveOpportunitiesPort {
  isAvailable() {
    return false;
  }
  async scanDailyOpportunities(_organizationId: string, _companyId: string) {}
}
