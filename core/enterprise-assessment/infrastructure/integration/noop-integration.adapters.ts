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
  async syncAssessmentScores() {}
}

export class NoopExecutiveInnovationAdapter implements ExecutiveInnovationPort {
  isAvailable() {
    return false;
  }
  async submitRecommendations() {}
}

export class NoopExecutiveProjectsAdapter implements ExecutiveProjectsPort {
  isAvailable() {
    return false;
  }
  async createProjectsFromRoadmap() {}
}

export class NoopSoftwareFactoryAdapter implements SoftwareFactoryPort {
  isAvailable() {
    return false;
  }
  async evaluateSoftwareNeeds() {}
}

export class NoopExecutiveCEOAdapter implements ExecutiveCEOPort {
  isAvailable() {
    return false;
  }
  async deliverExecutiveBriefing() {}
}
