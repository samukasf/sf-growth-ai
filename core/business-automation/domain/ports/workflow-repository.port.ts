import type { AutomationWorkflowId, OrganizationId } from "../../shared";
import type {
  AutomationAction,
  AutomationCondition,
  AutomationTrigger,
  AutomationWorkflow,
} from "../entities";

export interface WorkflowRepository {
  save(workflow: AutomationWorkflow): Promise<void>;
  findById(id: AutomationWorkflowId): Promise<AutomationWorkflow | null>;
  findByOrganization(organizationId: OrganizationId): Promise<AutomationWorkflow[]>;
  saveTrigger(trigger: AutomationTrigger): Promise<void>;
  findTriggersByWorkflow(workflowId: AutomationWorkflowId): Promise<AutomationTrigger[]>;
  saveCondition(condition: AutomationCondition): Promise<void>;
  findConditionsByWorkflow(workflowId: AutomationWorkflowId): Promise<AutomationCondition[]>;
  saveAction(action: AutomationAction): Promise<void>;
  findActionsByWorkflow(workflowId: AutomationWorkflowId): Promise<AutomationAction[]>;
}
