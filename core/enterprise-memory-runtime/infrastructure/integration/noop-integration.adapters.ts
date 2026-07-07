import type {
  AIProviderPort,
  EnterpriseBrainPort,
  ExecutiveCEOPort,
  ExecutiveOrchestratorPort,
  ExecutiveReasoningPort,
  OrganizationBrainPort,
  SoftwareFactoryPort,
} from "../../application/ports/integration";

export class NoopAIProviderAdapter implements AIProviderPort {
  isAvailable(): boolean {
    return false;
  }
}

export class NoopExecutiveOrchestratorAdapter implements ExecutiveOrchestratorPort {
  isAvailable(): boolean {
    return false;
  }
}

export class NoopExecutiveReasoningAdapter implements ExecutiveReasoningPort {
  isAvailable(): boolean {
    return false;
  }
}

export class NoopExecutiveCEOAdapter implements ExecutiveCEOPort {
  isAvailable(): boolean {
    return false;
  }
}

export class NoopEnterpriseBrainAdapter implements EnterpriseBrainPort {
  isAvailable(): boolean {
    return false;
  }
}

export class NoopOrganizationBrainAdapter implements OrganizationBrainPort {
  isAvailable(): boolean {
    return false;
  }
}

export class NoopSoftwareFactoryAdapter implements SoftwareFactoryPort {
  isAvailable(): boolean {
    return false;
  }
}
