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
  async notifyBusinessDayStarted() {}
}

export class NoopClientLifecycleAdapter implements ClientLifecyclePort {
  isAvailable() {
    return false;
  }
  async syncBusinessDayEvent() {}
}

export class NoopCompanyBrainAdapter implements CompanyBrainPort {
  isAvailable() {
    return false;
  }
  async enrichDailyContext() {}
}

export class NoopEnterpriseBrainAdapter implements EnterpriseBrainPort {
  isAvailable() {
    return false;
  }
  async registerDailyOperations() {}
}

export class NoopExecutiveCEOAdapter implements ExecutiveCEOPort {
  isAvailable() {
    return false;
  }
  async deliverDailyBriefing() {}
}

export class NoopExecutiveCouncilAdapter implements ExecutiveCouncilPort {
  isAvailable() {
    return false;
  }
  async conveneDailyReview() {}
}

export class NoopExecutiveMissionsAdapter implements ExecutiveMissionsPort {
  isAvailable() {
    return false;
  }
  async assignDailyMissions() {}
}

export class NoopExecutiveOpportunitiesAdapter implements ExecutiveOpportunitiesPort {
  isAvailable() {
    return false;
  }
  async scanDailyOpportunities() {}
}
