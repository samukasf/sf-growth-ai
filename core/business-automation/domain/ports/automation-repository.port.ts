import type { AutomationId, OrganizationId } from "../../shared";
import type {
  Automation,
  AutomationApproval,
  AutomationExecution,
  AutomationLog,
  AutomationResult,
  AutomationSchedule,
} from "../entities";

export interface AutomationRepository {
  save(automation: Automation): Promise<void>;
  findById(id: AutomationId): Promise<Automation | null>;
  findByOrganization(organizationId: OrganizationId): Promise<Automation[]>;
  saveExecution(execution: AutomationExecution): Promise<void>;
  findExecutionById(id: string): Promise<AutomationExecution | null>;
  findExecutionsByAutomation(automationId: AutomationId): Promise<AutomationExecution[]>;
  saveLog(log: AutomationLog): Promise<void>;
  findLogsByExecution(executionId: string): Promise<AutomationLog[]>;
  saveApproval(approval: AutomationApproval): Promise<void>;
  findApprovalById(id: string): Promise<AutomationApproval | null>;
  saveSchedule(schedule: AutomationSchedule): Promise<void>;
  findSchedulesByOrganization(organizationId: OrganizationId): Promise<AutomationSchedule[]>;
  saveResult(result: AutomationResult): Promise<void>;
  findResultByExecution(executionId: string): Promise<AutomationResult | null>;
}
