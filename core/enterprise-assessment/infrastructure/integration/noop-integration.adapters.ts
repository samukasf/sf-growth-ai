import type { Assessment } from "../../domain";
import type {
  EnterpriseBrainPort,
  ExecutiveCEOPort,
  ExecutiveInnovationPort,
  ExecutiveProjectsPort,
  SoftwareFactoryPort,
} from "../../application/ports/integration";

export class NoopEnterpriseBrainAdapter implements EnterpriseBrainPort {
  isAvailable() {
    return false;
  }
  async syncAssessmentScores(_assessment: Assessment) {}
}

export class NoopExecutiveInnovationAdapter implements ExecutiveInnovationPort {
  isAvailable() {
    return false;
  }
  async submitRecommendations(
    _organizationId: string,
    _companyId: string,
    _recommendations: Record<string, unknown>[],
  ) {}
}

export class NoopExecutiveProjectsAdapter implements ExecutiveProjectsPort {
  isAvailable() {
    return false;
  }
  async createProjectsFromRoadmap(
    _organizationId: string,
    _companyId: string,
    _roadmap: Record<string, unknown>,
  ) {}
}

export class NoopSoftwareFactoryAdapter implements SoftwareFactoryPort {
  isAvailable() {
    return false;
  }
  async evaluateSoftwareNeeds(
    _organizationId: string,
    _companyId: string,
    _recommendations: Record<string, unknown>[],
  ) {}
}

export class NoopExecutiveCEOAdapter implements ExecutiveCEOPort {
  isAvailable() {
    return false;
  }
  async deliverExecutiveBriefing(
    _organizationId: string,
    _companyId: string,
    _briefing: Record<string, unknown>,
  ) {}
}
