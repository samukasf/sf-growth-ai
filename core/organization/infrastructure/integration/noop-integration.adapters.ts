import type {
  AISoftwareFactoryPort,
  CompanyBrainPort,
  ExecutiveCEOPort,
  ExecutiveExperiencePort,
  ExecutiveInnovationPort,
  ExecutiveKnowledgePort,
  ExecutiveLearningPort,
  ExecutiveMemoryPort,
  ExecutiveOrchestratorPort,
  ExecutiveProjectGeneratorPort,
  ExecutiveWisdomPort,
} from "../../application/ports/integration";

function createNoopPort(): { isAvailable: () => false } {
  return { isAvailable: () => false };
}

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

export class NoopCompanyBrainAdapter implements CompanyBrainPort {
  isAvailable(): boolean {
    return false;
  }
}

export class NoopExecutiveMemoryAdapter implements ExecutiveMemoryPort {
  isAvailable(): boolean {
    return false;
  }
}

export class NoopExecutiveKnowledgeAdapter implements ExecutiveKnowledgePort {
  isAvailable(): boolean {
    return false;
  }
}

export class NoopExecutiveLearningAdapter implements ExecutiveLearningPort {
  isAvailable(): boolean {
    return false;
  }
}

export class NoopExecutiveExperienceAdapter implements ExecutiveExperiencePort {
  isAvailable(): boolean {
    return false;
  }
}

export class NoopExecutiveWisdomAdapter implements ExecutiveWisdomPort {
  isAvailable(): boolean {
    return false;
  }
}

export class NoopExecutiveInnovationAdapter implements ExecutiveInnovationPort {
  isAvailable(): boolean {
    return false;
  }
}

export class NoopExecutiveProjectGeneratorAdapter implements ExecutiveProjectGeneratorPort {
  isAvailable(): boolean {
    return false;
  }
}

export class NoopAISoftwareFactoryAdapter implements AISoftwareFactoryPort {
  isAvailable(): boolean {
    return false;
  }
}

export const noopIntegrationPorts = createNoopPort;
