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
  async notifySoftwareFactoryRequested() {}
}

export class NoopEnterpriseBrainAdapter implements EnterpriseBrainPort {
  isAvailable() {
    return false;
  }
  async syncSoftwareProjects() {}
}

export class NoopExecutiveCEOAdapter implements ExecutiveCEOPort {
  isAvailable() {
    return false;
  }
  async deliverSoftwareBriefing() {}
}

export class NoopExecutiveCouncilAdapter implements ExecutiveCouncilPort {
  isAvailable() {
    return false;
  }
  async requestSoftwareApproval() {}
}

export class NoopBusinessAutomationPlatformAdapter implements BusinessAutomationPlatformPort {
  isAvailable() {
    return false;
  }
  async evaluateAutomationBlueprint() {}
}

export class NoopAIProviderLayerAdapter implements AIProviderLayerPort {
  isAvailable() {
    return false;
  }
  async registerPlannedGeneration() {}
}
