import type {
  BusinessCommunicationPort,
  CompanyBrainPort,
  ExecutiveCRMPort,
  ExecutiveOrchestratorPort,
  ExecutiveProjectsPort,
  OrganizationBrainPort,
  SoftwareFactoryPort,
} from "../../application/ports/integration";

export class NoopBusinessCommunicationAdapter implements BusinessCommunicationPort {
  isAvailable(): boolean {
    return false;
  }
}

export class NoopExecutiveCRMAdapter implements ExecutiveCRMPort {
  isAvailable(): boolean {
    return false;
  }
}

export class NoopExecutiveProjectsAdapter implements ExecutiveProjectsPort {
  isAvailable(): boolean {
    return false;
  }
}

export class NoopExecutiveOrchestratorAdapter implements ExecutiveOrchestratorPort {
  isAvailable(): boolean {
    return false;
  }
}

export class NoopCompanyBrainAdapter implements CompanyBrainPort {
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
