import type {
  CompanyBrainPort,
  ExecutiveCEOPort,
  ExecutiveOrchestratorPort,
  ExecutiveReasoningPort,
  SoftwareFactoryPort,
} from "../../application/ports/integration";

export class NoopExecutiveOrchestratorAdapter implements ExecutiveOrchestratorPort {
  isAvailable(): boolean {
    return false;
  }
}

export class NoopExecutiveCEOAdapter implements ExecutiveCEOPort {
  isAvailable(): boolean {
    return false;
  }
}

export class NoopExecutiveReasoningAdapter implements ExecutiveReasoningPort {
  isAvailable(): boolean {
    return false;
  }
}

export class NoopCompanyBrainAdapter implements CompanyBrainPort {
  isAvailable(): boolean {
    return false;
  }
}

export class NoopSoftwareFactoryAdapter implements SoftwareFactoryPort {
  isAvailable(): boolean {
    return false;
  }
}
