import type { EventDispatcher } from "../shared";
import type {
  ActionEngine,
  ApprovalEngine,
  AuditEngine,
  AutomationRepository,
  ConditionEngine,
  ExecutionEngine,
  ScheduleEngine,
  TriggerEngine,
  WorkflowRepository,
} from "../domain";
import type {
  BusinessCommunicationPort,
  CompanyBrainPort,
  ExecutiveCRMPort,
  ExecutiveOrchestratorPort,
  ExecutiveProjectsPort,
  OrganizationBrainPort,
  SoftwareFactoryPort,
} from "./ports/integration";

export type BusinessAutomationDependencies = {
  automationRepository: AutomationRepository;
  workflowRepository: WorkflowRepository;
  triggerEngine: TriggerEngine;
  conditionEngine: ConditionEngine;
  actionEngine: ActionEngine;
  executionEngine: ExecutionEngine;
  approvalEngine: ApprovalEngine;
  scheduleEngine: ScheduleEngine;
  auditEngine: AuditEngine;
  eventDispatcher: EventDispatcher;
  businessCommunication: BusinessCommunicationPort;
  executiveCrm: ExecutiveCRMPort;
  executiveProjects: ExecutiveProjectsPort;
  executiveOrchestrator: ExecutiveOrchestratorPort;
  companyBrain: CompanyBrainPort;
  organizationBrain: OrganizationBrainPort;
  softwareFactory: SoftwareFactoryPort;
};
