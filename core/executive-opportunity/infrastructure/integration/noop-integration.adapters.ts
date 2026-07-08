import type { BusinessOpportunity } from "../../domain";
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
  async syncOpportunities(
    _organizationId: string,
    _companyId: string,
    _opportunities: Record<string, unknown>[],
  ) {}
}

export class NoopEnterpriseAssessmentAdapter implements EnterpriseAssessmentPort {
  isAvailable() {
    return false;
  }
  async getAssessmentScores(_organizationId: string, _companyId: string): Promise<Record<string, number>> {
    return {};
  }
}

export class NoopExecutiveCEOAdapter implements ExecutiveCEOPort {
  isAvailable() {
    return false;
  }
  async deliverOpportunityBriefing(
    _organizationId: string,
    _companyId: string,
    _briefing: Record<string, unknown>,
  ) {}
}

export class NoopExecutiveCouncilAdapter implements ExecutiveCouncilPort {
  isAvailable() {
    return false;
  }
  async submitForCouncilReview(
    _organizationId: string,
    _companyId: string,
    _opportunity: Record<string, unknown>,
  ) {}
}

export class NoopExecutiveProjectsAdapter implements ExecutiveProjectsPort {
  isAvailable() {
    return false;
  }
  async createProjectFromOpportunity(
    _organizationId: string,
    _companyId: string,
    _opportunity: Record<string, unknown>,
    _executionPlan: Record<string, unknown>,
  ) {}
}

export class NoopSoftwareFactoryAdapter implements SoftwareFactoryPort {
  isAvailable() {
    return false;
  }
  async evaluateSoftwareOpportunity(
    _organizationId: string,
    _companyId: string,
    _opportunity: BusinessOpportunity,
  ) {}
}

export class NoopBusinessAutomationAdapter implements BusinessAutomationPort {
  isAvailable() {
    return false;
  }
  async evaluateAutomationOpportunity(
    _organizationId: string,
    _companyId: string,
    _opportunity: BusinessOpportunity,
  ) {}
}
