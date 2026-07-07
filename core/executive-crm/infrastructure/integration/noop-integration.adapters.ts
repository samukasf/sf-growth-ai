import type {
  BusinessAutomationPort,
  BusinessCommunicationPort,
  CompanyBrainPort,
  ExecutiveCEOPort,
  ExecutiveFinancePort,
  ExecutiveMarketingPort,
  ExecutiveOrchestratorPort,
  ExecutiveSalesPort,
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

export class NoopOrganizationBrainAdapter implements OrganizationBrainPort {
  isAvailable(): boolean {
    return false;
  }
}

export class NoopExecutiveMarketingAdapter implements ExecutiveMarketingPort {
  isAvailable(): boolean {
    return false;
  }
}

export class NoopExecutiveSalesAdapter implements ExecutiveSalesPort {
  isAvailable(): boolean {
    return false;
  }
}

export class NoopExecutiveFinanceAdapter implements ExecutiveFinancePort {
  isAvailable(): boolean {
    return false;
  }
}
