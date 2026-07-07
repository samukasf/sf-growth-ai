import type { BusinessAutomationDependencies } from "../../application";
import { BusinessAutomationService } from "../../application";
import { InMemoryEventBus } from "../events/in-memory-event-bus";
import {
  NoopBusinessCommunicationAdapter,
  NoopCompanyBrainAdapter,
  NoopExecutiveCRMAdapter,
  NoopExecutiveOrchestratorAdapter,
  NoopExecutiveProjectsAdapter,
  NoopOrganizationBrainAdapter,
  NoopSoftwareFactoryAdapter,
} from "../integration/noop-integration.adapters";
import { InMemoryAutomationRepository } from "../persistence/in-memory-automation.repository";
import { InMemoryWorkflowRepository } from "../persistence/in-memory-workflow.repository";
import { DefaultActionEngine } from "../services/default-action-engine";
import { DefaultApprovalEngine } from "../services/default-approval-engine";
import { DefaultAuditEngine } from "../services/default-audit-engine";
import { DefaultConditionEngine } from "../services/default-condition-engine";
import { DefaultExecutionEngine } from "../services/default-execution-engine";
import { DefaultScheduleEngine } from "../services/default-schedule-engine";
import { DefaultTriggerEngine } from "../services/default-trigger-engine";

export type CreateBusinessAutomationOptions = {
  dependencies?: Partial<BusinessAutomationDependencies>;
};

export function createBusinessAutomation(
  options: CreateBusinessAutomationOptions = {},
): BusinessAutomationService {
  const dependencies: BusinessAutomationDependencies = {
    automationRepository:
      options.dependencies?.automationRepository ?? new InMemoryAutomationRepository(),
    workflowRepository:
      options.dependencies?.workflowRepository ?? new InMemoryWorkflowRepository(),
    triggerEngine: options.dependencies?.triggerEngine ?? new DefaultTriggerEngine(),
    conditionEngine: options.dependencies?.conditionEngine ?? new DefaultConditionEngine(),
    actionEngine: options.dependencies?.actionEngine ?? new DefaultActionEngine(),
    executionEngine: options.dependencies?.executionEngine ?? new DefaultExecutionEngine(),
    approvalEngine: options.dependencies?.approvalEngine ?? new DefaultApprovalEngine(),
    scheduleEngine: options.dependencies?.scheduleEngine ?? new DefaultScheduleEngine(),
    auditEngine: options.dependencies?.auditEngine ?? new DefaultAuditEngine(),
    eventDispatcher: options.dependencies?.eventDispatcher ?? new InMemoryEventBus(),
    businessCommunication:
      options.dependencies?.businessCommunication ?? new NoopBusinessCommunicationAdapter(),
    executiveCrm: options.dependencies?.executiveCrm ?? new NoopExecutiveCRMAdapter(),
    executiveProjects:
      options.dependencies?.executiveProjects ?? new NoopExecutiveProjectsAdapter(),
    executiveOrchestrator:
      options.dependencies?.executiveOrchestrator ?? new NoopExecutiveOrchestratorAdapter(),
    companyBrain: options.dependencies?.companyBrain ?? new NoopCompanyBrainAdapter(),
    organizationBrain:
      options.dependencies?.organizationBrain ?? new NoopOrganizationBrainAdapter(),
    softwareFactory:
      options.dependencies?.softwareFactory ?? new NoopSoftwareFactoryAdapter(),
  };

  return new BusinessAutomationService(dependencies);
}
