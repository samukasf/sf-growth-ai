import type { CompanyProfile } from "../../domain";
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
  async syncProfile(_profile: CompanyProfile) {}
}

export class NoopOrganizationBrainAdapter implements OrganizationBrainPort {
  isAvailable() {
    return false;
  }
  async registerOrganization(_organizationId: string, _companyId: string) {}
}

export class NoopExecutiveMemoryAdapter implements ExecutiveMemoryPort {
  isAvailable() {
    return false;
  }
  async storeDiscoveryInsights(
    _organizationId: string,
    _companyId: string,
    _insights: Record<string, unknown>,
  ) {}
}

export class NoopExecutiveKnowledgeAdapter implements ExecutiveKnowledgePort {
  isAvailable() {
    return false;
  }
  async ingestProfile(_profile: CompanyProfile) {}
}

export class NoopExecutiveInnovationAdapter implements ExecutiveInnovationPort {
  isAvailable() {
    return false;
  }
  async submitOpportunities(
    _organizationId: string,
    _companyId: string,
    _opportunities: Record<string, unknown>[],
  ) {}
}

export class NoopExecutiveProjectGeneratorAdapter implements ExecutiveProjectGeneratorPort {
  isAvailable() {
    return false;
  }
  async generateFromGaps(
    _organizationId: string,
    _companyId: string,
    _gaps: Record<string, unknown>[],
  ) {}
}
