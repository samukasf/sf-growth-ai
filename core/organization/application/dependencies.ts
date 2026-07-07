import type { EventDispatcher } from "../shared";
import type {
  AccessPolicyEngine,
  AuditService,
  DecisionAuthorityEngine,
  DepartmentResolver,
  IdentityResolver,
  OrganizationHierarchyResolver,
  OrganizationRepository,
  PermissionRepository,
  RoleRepository,
} from "../domain";
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
} from "./ports/integration";

export type OrganizationIntelligenceDependencies = {
  organizationRepository: OrganizationRepository;
  roleRepository: RoleRepository;
  permissionRepository: PermissionRepository;
  identityResolver: IdentityResolver;
  accessPolicyEngine: AccessPolicyEngine;
  decisionAuthorityEngine: DecisionAuthorityEngine;
  hierarchyResolver: OrganizationHierarchyResolver;
  departmentResolver: DepartmentResolver;
  auditService: AuditService;
  eventDispatcher: EventDispatcher;
  executiveOrchestrator: ExecutiveOrchestratorPort;
  executiveCeo: ExecutiveCEOPort;
  companyBrain: CompanyBrainPort;
  executiveMemory: ExecutiveMemoryPort;
  executiveKnowledge: ExecutiveKnowledgePort;
  executiveLearning: ExecutiveLearningPort;
  executiveExperience: ExecutiveExperiencePort;
  executiveWisdom: ExecutiveWisdomPort;
  executiveInnovation: ExecutiveInnovationPort;
  executiveProjectGenerator: ExecutiveProjectGeneratorPort;
  aiSoftwareFactory: AISoftwareFactoryPort;
};
