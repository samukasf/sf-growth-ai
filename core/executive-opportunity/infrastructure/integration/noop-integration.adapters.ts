import type {
  BusinessAutomationPort,
  EnterpriseAssessmentPort,
  EnterpriseBrainPort,
  ExecutiveCEOPort,
  ExecutiveCouncilPort,
  ExecutiveProjectsPort,
  SoftwareFactoryPort,
} from "../../application/ports/integration";

export class NoopEnterpriseBrainAdapter implements EnterpriseBrainPort {
  isAvailable() {
    return false;
  }
  async syncOpportunities() {}
}

export class NoopEnterpriseAssessmentAdapter implements EnterpriseAssessmentPort {
  isAvailable() {
    return false;
  }
  async getAssessmentScores(): Promise<Record<string, number>> {
    return {};
  }
}

export class NoopExecutiveCEOAdapter implements ExecutiveCEOPort {
  isAvailable() {
    return false;
  }
  async deliverOpportunityBriefing() {}
}

export class NoopExecutiveCouncilAdapter implements ExecutiveCouncilPort {
  isAvailable() {
    return false;
  }
  async submitForCouncilReview() {}
}

export class NoopExecutiveProjectsAdapter implements ExecutiveProjectsPort {
  isAvailable() {
    return false;
  }
  async createProjectFromOpportunity() {}
}

export class NoopSoftwareFactoryAdapter implements SoftwareFactoryPort {
  isAvailable() {
    return false;
  }
  async evaluateSoftwareOpportunity() {}
}

export class NoopBusinessAutomationAdapter implements BusinessAutomationPort {
  isAvailable() {
    return false;
  }
  async evaluateAutomationOpportunity() {}
}
