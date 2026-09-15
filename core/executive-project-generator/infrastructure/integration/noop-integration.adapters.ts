import type {
  BusinessAutomationPlatformPort,
  EnterpriseBrainPort,
  ExecutiveCEOPort,
  ExecutiveCouncilPort,
  ExecutiveMissionSystemPort,
  ExecutiveOpportunityEnginePort,
  SoftwareFactoryPort,
} from "../../application/ports/integration";

export class NoopEnterpriseBrainAdapter implements EnterpriseBrainPort {
  isAvailable() {
    return false;
  }
  async syncProjects() {}
}

export class NoopExecutiveOpportunityEngineAdapter implements ExecutiveOpportunityEnginePort {
  isAvailable() {
    return false;
  }
  async getOpportunityById() {
    return null;
  }
  async notifyProjectGenerated() {}
}

export class NoopExecutiveMissionSystemAdapter implements ExecutiveMissionSystemPort {
  isAvailable() {
    return false;
  }
  async getMissionFindings(): Promise<Record<string, unknown>[]> {
    return [];
  }
  async notifyProjectGeneratedFromMission() {}
}

export class NoopExecutiveCEOAdapter implements ExecutiveCEOPort {
  isAvailable() {
    return false;
  }
  async deliverProjectBriefing() {}
}

export class NoopExecutiveCouncilAdapter implements ExecutiveCouncilPort {
  isAvailable() {
    return false;
  }
  async requestApproval() {}
}

export class NoopBusinessAutomationPlatformAdapter implements BusinessAutomationPlatformPort {
  isAvailable() {
    return false;
  }
  async evaluateAutomationProject() {}
}

export class NoopSoftwareFactoryAdapter implements SoftwareFactoryPort {
  isAvailable() {
    return false;
  }
  async evaluateSoftwareProject() {}
}
