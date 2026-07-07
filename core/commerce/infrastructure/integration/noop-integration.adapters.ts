import type {
  BusinessAutomationPort,
  BusinessCommunicationPort,
  CompanyBrainPort,
  ExecutiveCrmPort,
  ExecutiveFinancePort,
  ExecutiveOperationsPort,
  ExecutiveSalesPort,
  OrganizationBrainPort,
  SoftwareFactoryPort,
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

export class NoopExecutiveFinanceAdapter implements ExecutiveFinancePort {
  isAvailable(): boolean {
    return false;
  }
}

export class NoopExecutiveSalesAdapter implements ExecutiveSalesPort {
  isAvailable(): boolean {
    return false;
  }
}

export class NoopExecutiveOperationsAdapter implements ExecutiveOperationsPort {
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
