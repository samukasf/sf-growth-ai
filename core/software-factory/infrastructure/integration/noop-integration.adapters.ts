import type { SoftwareProject } from "../../domain";
import type {
  AIProviderLayerPort,
  BusinessAutomationPlatformPort,
  EnterpriseBrainPort,
  ExecutiveCEOPort,
  ExecutiveCouncilPort,
  ExecutiveProjectGeneratorPort,
} from "../../application/ports/integration";

export class NoopExecutiveProjectGeneratorAdapter implements ExecutiveProjectGeneratorPort {
  isAvailable() {
    return false;
  }
  async notifySoftwareFactoryRequested(
    _organizationId: string,
    _companyId: string,
    _project: SoftwareProject,
  ) {}
}

export class NoopEnterpriseBrainAdapter implements EnterpriseBrainPort {
  isAvailable() {
    return false;
  }
  async syncSoftwareProjects(
    _organizationId: string,
    _companyId: string,
    _projects: Record<string, unknown>[],
  ) {}
}

export class NoopExecutiveCEOAdapter implements ExecutiveCEOPort {
  isAvailable() {
    return false;
  }
  async deliverSoftwareBriefing(
    _organizationId: string,
    _companyId: string,
    _briefing: Record<string, unknown>,
  ) {}
}

export class NoopExecutiveCouncilAdapter implements ExecutiveCouncilPort {
  isAvailable() {
    return false;
  }
  async requestSoftwareApproval(
    _organizationId: string,
    _companyId: string,
    _approval: Record<string, unknown>,
  ) {}
}

export class NoopBusinessAutomationPlatformAdapter implements BusinessAutomationPlatformPort {
  isAvailable() {
    return false;
  }
  async evaluateAutomationBlueprint(
    _organizationId: string,
    _companyId: string,
    _project: SoftwareProject,
  ) {}
}

export class NoopAIProviderLayerAdapter implements AIProviderLayerPort {
  isAvailable() {
    return false;
  }
  async registerPlannedGeneration(
    _organizationId: string,
    _companyId: string,
    _project: SoftwareProject,
  ) {}
}

