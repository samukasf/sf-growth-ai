import type { OrganizationIntelligenceDependencies } from "../../application";
import { OrganizationIntelligenceService } from "../../application";
import { InMemoryEventBus } from "../events/in-memory-event-bus";
import {
  NoopAISoftwareFactoryAdapter,
  NoopCompanyBrainAdapter,
  NoopExecutiveCEOAdapter,
  NoopExecutiveExperienceAdapter,
  NoopExecutiveInnovationAdapter,
  NoopExecutiveKnowledgeAdapter,
  NoopExecutiveLearningAdapter,
  NoopExecutiveMemoryAdapter,
  NoopExecutiveOrchestratorAdapter,
  NoopExecutiveProjectGeneratorAdapter,
  NoopExecutiveWisdomAdapter,
} from "../integration/noop-integration.adapters";
import {
  InMemoryOrganizationRepository,
  InMemoryRoleRepository,
} from "../persistence/in-memory-organization.repository";
import { InMemoryPermissionRepository } from "../persistence/in-memory-permission.repository";
import { DefaultAccessPolicyEngine } from "../services/default-access-policy-engine";
import { DefaultAuditService } from "../services/default-audit-service";
import { DefaultDecisionAuthorityEngine } from "../services/default-decision-authority-engine";
import { DefaultIdentityResolver } from "../services/default-identity-resolver";
import {
  DefaultDepartmentResolver,
  DefaultOrganizationHierarchyResolver,
} from "../services/default-resolvers";

export type CreateOrganizationIntelligenceOptions = {
  dependencies?: Partial<OrganizationIntelligenceDependencies>;
};

export function createOrganizationIntelligence(
  options: CreateOrganizationIntelligenceOptions = {},
): OrganizationIntelligenceService {
  const organizationRepository =
    options.dependencies?.organizationRepository ?? new InMemoryOrganizationRepository();

  const dependencies: OrganizationIntelligenceDependencies = {
    organizationRepository,
    roleRepository: options.dependencies?.roleRepository ?? new InMemoryRoleRepository(),
    permissionRepository:
      options.dependencies?.permissionRepository ?? new InMemoryPermissionRepository(),
    identityResolver:
      options.dependencies?.identityResolver ?? new DefaultIdentityResolver(organizationRepository),
    accessPolicyEngine:
      options.dependencies?.accessPolicyEngine ??
      new DefaultAccessPolicyEngine(organizationRepository),
    decisionAuthorityEngine:
      options.dependencies?.decisionAuthorityEngine ??
      new DefaultDecisionAuthorityEngine(organizationRepository),
    hierarchyResolver:
      options.dependencies?.hierarchyResolver ??
      new DefaultOrganizationHierarchyResolver(organizationRepository),
    departmentResolver:
      options.dependencies?.departmentResolver ??
      new DefaultDepartmentResolver(organizationRepository),
    auditService:
      options.dependencies?.auditService ?? new DefaultAuditService(organizationRepository),
    eventDispatcher: options.dependencies?.eventDispatcher ?? new InMemoryEventBus(),
    executiveOrchestrator:
      options.dependencies?.executiveOrchestrator ?? new NoopExecutiveOrchestratorAdapter(),
    executiveCeo: options.dependencies?.executiveCeo ?? new NoopExecutiveCEOAdapter(),
    companyBrain: options.dependencies?.companyBrain ?? new NoopCompanyBrainAdapter(),
    executiveMemory: options.dependencies?.executiveMemory ?? new NoopExecutiveMemoryAdapter(),
    executiveKnowledge:
      options.dependencies?.executiveKnowledge ?? new NoopExecutiveKnowledgeAdapter(),
    executiveLearning:
      options.dependencies?.executiveLearning ?? new NoopExecutiveLearningAdapter(),
    executiveExperience:
      options.dependencies?.executiveExperience ?? new NoopExecutiveExperienceAdapter(),
    executiveWisdom: options.dependencies?.executiveWisdom ?? new NoopExecutiveWisdomAdapter(),
    executiveInnovation:
      options.dependencies?.executiveInnovation ?? new NoopExecutiveInnovationAdapter(),
    executiveProjectGenerator:
      options.dependencies?.executiveProjectGenerator ??
      new NoopExecutiveProjectGeneratorAdapter(),
    aiSoftwareFactory:
      options.dependencies?.aiSoftwareFactory ?? new NoopAISoftwareFactoryAdapter(),
  };

  return new OrganizationIntelligenceService(dependencies);
}
