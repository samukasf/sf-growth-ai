import type {
  BusinessAutomationPort,
  BusinessCommunicationPort,
  CompanyBrainPort,
  ExecutiveCrmPort,
  ExecutiveHRPort,
  ExecutiveOperationsPort,
  ExecutiveOrchestratorPort,
  OrganizationBrainPort,
} from "../../application/ports/integration";

export class NoopBusinessCommunicationAdapter implements BusinessCommunicationPort {
  isAvailable(): boolean {
    return false;
  }
}

export class NoopBusinessAutomationAdapter implements BusinessAutomationPort {
  isAvailable(): boolean {
    return false;
  }
}

export class NoopExecutiveCrmAdapter implements ExecutiveCrmPort {
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

export class NoopExecutiveOperationsAdapter implements ExecutiveOperationsPort {
  isAvailable(): boolean {
    return false;
  }
}

export class NoopExecutiveHRAdapter implements ExecutiveHRPort {
  isAvailable(): boolean {
    return false;
  }
}
