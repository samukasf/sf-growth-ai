import type {
  AIProviderPort,
  ExecutiveCEOPort,
  ExecutiveOrchestratorPort,
  ExecutiveReasoningPort,
  MarketplacePort,
  SoftwareFactoryPort,
} from "../../application/ports/integration";

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

export class NoopAIProviderAdapter implements AIProviderPort {
  isAvailable(): boolean {
    return false;
  }
}

export class NoopSoftwareFactoryAdapter implements SoftwareFactoryPort {
  isAvailable(): boolean {
    return false;
  }
}

export class NoopMarketplaceAdapter implements MarketplacePort {
  isAvailable(): boolean {
    return false;
  }
}
