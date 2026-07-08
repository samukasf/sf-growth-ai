import type { ExecutiveProject, ProjectOpportunity } from "../../domain";
import type {
  BusinessAutomationPlatformPort,
  EnterpriseBrainPort,
  ExecutiveCEOPort,
  ExecutiveCouncilPort,
  ExecutiveMissionSystemPort,
  ExecutiveOpportunityEnginePort,
  SoftwareFactoryPort,
} from "../../application/ports/integration";
import type { ProjectApprovalRequest } from "../../domain";

export class NoopEnterpriseBrainAdapter implements EnterpriseBrainPort {
  isAvailable() {
    return false;
  }
  async syncProjects(_organizationId: string, _companyId: string, _projects: Record<string, unknown>[]) {}
}

export class NoopExecutiveOpportunityEngineAdapter implements ExecutiveOpportunityEnginePort {
  isAvailable() {
    return false;
  }
  async getOpportunityById(_organizationId: string, _companyId: string, _opportunityId: string) {
    return null;
  }
  async notifyProjectGenerated(_organizationId: string, _companyId: string, _project: ExecutiveProject) {}
}

export class NoopExecutiveMissionSystemAdapter implements ExecutiveMissionSystemPort {
  isAvailable() {
    return false;
  }
  async getMissionFindings(_organizationId: string, _companyId: string): Promise<Record<string, unknown>[]> {
    return [];
  }
  async notifyProjectGeneratedFromMission(
    _organizationId: string,
    _companyId: string,
    _opportunity: ProjectOpportunity,
    _project: ExecutiveProject,
  ) {}
}

export class NoopExecutiveCEOAdapter implements ExecutiveCEOPort {
  isAvailable() {
    return false;
  }
  async deliverProjectBriefing(_organizationId: string, _companyId: string, _briefing: Record<string, unknown>) {}
}

export class NoopExecutiveCouncilAdapter implements ExecutiveCouncilPort {
  isAvailable() {
    return false;
  }
  async requestApproval(_organizationId: string, _companyId: string, _request: ProjectApprovalRequest) {}
}

export class NoopBusinessAutomationPlatformAdapter implements BusinessAutomationPlatformPort {
  isAvailable() {
    return false;
  }
  async evaluateAutomationProject(_organizationId: string, _companyId: string, _project: ExecutiveProject) {}
}

export class NoopSoftwareFactoryAdapter implements SoftwareFactoryPort {
  isAvailable() {
    return false;
  }
  async evaluateSoftwareProject(_organizationId: string, _companyId: string, _project: ExecutiveProject) {}
}

