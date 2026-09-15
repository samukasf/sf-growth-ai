import type {
  EnterpriseBrainPort,
  ExecutiveInnovationPort,
  ExecutiveKnowledgePort,
  ExecutiveMemoryPort,
  ExecutiveProjectGeneratorPort,
  OrganizationBrainPort,
} from "../../application/ports/integration";

export class NoopEnterpriseBrainAdapter implements EnterpriseBrainPort {
  isAvailable() {
    return false;
  }
  async syncProfile() {}
}

export class NoopOrganizationBrainAdapter implements OrganizationBrainPort {
  isAvailable() {
    return false;
  }
  async registerOrganization() {}
}

export class NoopExecutiveMemoryAdapter implements ExecutiveMemoryPort {
  isAvailable() {
    return false;
  }
  async storeDiscoveryInsights() {}
}

export class NoopExecutiveKnowledgeAdapter implements ExecutiveKnowledgePort {
  isAvailable() {
    return false;
  }
  async ingestProfile() {}
}

export class NoopExecutiveInnovationAdapter implements ExecutiveInnovationPort {
  isAvailable() {
    return false;
  }
  async submitOpportunities() {}
}

export class NoopExecutiveProjectGeneratorAdapter implements ExecutiveProjectGeneratorPort {
  isAvailable() {
    return false;
  }
  async generateFromGaps() {}
}
