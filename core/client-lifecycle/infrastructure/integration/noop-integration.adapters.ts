import type { ClientExecutiveStackProps } from "../../domain";
import type {
  AgencyCorePort,
  BusinessAutomationPort,
  BusinessCommunicationPort,
  CompanyBrainPort,
  ExecutiveCEOPort,
  ExecutiveCouncilPort,
  ExecutiveCRMPort,
  ExecutiveDashboardPort,
  ExecutiveMemoryPort,
  ExecutiveMissionsPort,
  ExecutiveTimelinePort,
} from "../../application/ports/integration";

export class NoopAgencyCoreAdapter implements AgencyCorePort {
  isAvailable() {
    return false;
  }
  async registerClient(
    _organizationId: string,
    _agencyId: string,
    _companyId: string,
    _clientName: string,
  ) {}
}

export class NoopCompanyBrainAdapter implements CompanyBrainPort {
  isAvailable() {
    return false;
  }
  async activate(
    _organizationId: string,
    _agencyId: string,
    _companyId: string,
    _executiveStack: ClientExecutiveStackProps,
  ) {
    return { companyBrainId: "" };
  }
}

export class NoopExecutiveCEOAdapter implements ExecutiveCEOPort {
  isAvailable() {
    return false;
  }
  async assignToClient(
    _organizationId: string,
    _companyId: string,
    _executiveStack: ClientExecutiveStackProps,
  ) {}
}

export class NoopExecutiveCouncilAdapter implements ExecutiveCouncilPort {
  isAvailable() {
    return false;
  }
  async provisionCouncil(
    _organizationId: string,
    _companyId: string,
    _executiveStack: ClientExecutiveStackProps,
  ) {}
}

export class NoopExecutiveCRMAdapter implements ExecutiveCRMPort {
  isAvailable() {
    return false;
  }
  async syncLead(
    _organizationId: string,
    _agencyId: string,
    _leadId: string,
    _name: string,
  ) {}
  async syncProposalAccepted(
    _organizationId: string,
    _agencyId: string,
    _companyId: string,
    _proposalId: string,
  ) {}
}

export class NoopBusinessCommunicationAdapter implements BusinessCommunicationPort {
  isAvailable() {
    return false;
  }
  async notifyClientEvent(
    _organizationId: string,
    _agencyId: string,
    _companyId: string,
    _eventType: string,
  ) {}
}

export class NoopBusinessAutomationAdapter implements BusinessAutomationPort {
  isAvailable() {
    return false;
  }
  async triggerLifecycleAutomation(
    _organizationId: string,
    _agencyId: string,
    _companyId: string,
    _eventType: string,
  ) {}
}

export class NoopExecutiveMemoryAdapter implements ExecutiveMemoryPort {
  isAvailable() {
    return false;
  }
  async provisionMemory(
    _organizationId: string,
    _companyId: string,
    _executiveStack: ClientExecutiveStackProps,
  ) {}
  async recordEvent(
    _organizationId: string,
    _companyId: string,
    _eventType: string,
    _payload: Record<string, unknown>,
  ) {}
}

export class NoopExecutiveTimelineAdapter implements ExecutiveTimelinePort {
  isAvailable() {
    return false;
  }
  async provisionTimeline(
    _organizationId: string,
    _companyId: string,
    _executiveStack: ClientExecutiveStackProps,
  ) {}
  async appendEntry(
    _organizationId: string,
    _companyId: string,
    _title: string,
    _description: string,
  ) {}
}

export class NoopExecutiveDashboardAdapter implements ExecutiveDashboardPort {
  isAvailable() {
    return false;
  }
  async provisionDashboard(
    _organizationId: string,
    _companyId: string,
    _executiveStack: ClientExecutiveStackProps,
  ) {}
}

export class NoopExecutiveMissionsAdapter implements ExecutiveMissionsPort {
  isAvailable() {
    return false;
  }
  async provisionMissions(
    _organizationId: string,
    _companyId: string,
    _executiveStack: ClientExecutiveStackProps,
  ) {}
}
