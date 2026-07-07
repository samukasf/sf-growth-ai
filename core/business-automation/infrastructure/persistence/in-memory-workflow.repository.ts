import {
  AutomationAction,
  AutomationCondition,
  AutomationTrigger,
  AutomationWorkflow,
  type WorkflowRepository,
} from "../../domain";

function serializeWorkflow(workflow: AutomationWorkflow): string {
  return JSON.stringify(workflow.toJSON());
}

function deserializeWorkflow(raw: string): AutomationWorkflow {
  return AutomationWorkflow.create(
    JSON.parse(raw) as ReturnType<AutomationWorkflow["toJSON"]>,
  );
}

export class InMemoryWorkflowRepository implements WorkflowRepository {
  private readonly workflows = new Map<string, string>();
  private readonly triggers: AutomationTrigger[] = [];
  private readonly conditions: AutomationCondition[] = [];
  private readonly actions: AutomationAction[] = [];

  async save(workflow: AutomationWorkflow): Promise<void> {
    this.workflows.set(workflow.id, serializeWorkflow(workflow));
  }

  async findById(id: string): Promise<AutomationWorkflow | null> {
    const raw = this.workflows.get(id);
    return raw ? deserializeWorkflow(raw) : null;
  }

  async findByOrganization(organizationId: string): Promise<AutomationWorkflow[]> {
    const results: AutomationWorkflow[] = [];
    for (const raw of this.workflows.values()) {
      const workflow = deserializeWorkflow(raw);
      if (workflow.organizationId === organizationId) results.push(workflow);
    }
    return results;
  }

  async saveTrigger(trigger: AutomationTrigger): Promise<void> {
    this.triggers.push(trigger);
  }

  async findTriggersByWorkflow(workflowId: string): Promise<AutomationTrigger[]> {
    return this.triggers.filter((t) => t.workflowId === workflowId);
  }

  async saveCondition(condition: AutomationCondition): Promise<void> {
    this.conditions.push(condition);
  }

  async findConditionsByWorkflow(workflowId: string): Promise<AutomationCondition[]> {
    return this.conditions.filter((c) => c.workflowId === workflowId);
  }

  async saveAction(action: AutomationAction): Promise<void> {
    this.actions.push(action);
  }

  async findActionsByWorkflow(workflowId: string): Promise<AutomationAction[]> {
    return this.actions
      .filter((a) => a.workflowId === workflowId)
      .sort((a, b) => a.order - b.order);
  }
}
