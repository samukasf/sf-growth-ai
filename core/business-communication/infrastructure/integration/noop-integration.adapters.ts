import type {
  CompanyBrainPort,
  ExecutiveCEOPort,
  ExecutiveCRMPort,
  ExecutiveMarketingPort,
  ExecutiveOrchestratorPort,
  ExecutiveSalesPort,
  ExecutiveSupportPort,
  OrganizationBrainPort,
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

export class NoopExecutiveCRMAdapter implements ExecutiveCRMPort {
  isAvailable(): boolean {
    return false;
  }
}

export class NoopExecutiveSalesAdapter implements ExecutiveSalesPort {
  isAvailable(): boolean {
    return false;
  }
}

export class NoopExecutiveMarketingAdapter implements ExecutiveMarketingPort {
  isAvailable(): boolean {
    return false;
  }
}

export class NoopExecutiveSupportAdapter implements ExecutiveSupportPort {
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
