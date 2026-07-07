import {
  Automation,
  AutomationAction,
  AutomationCondition,
  AutomationTrigger,
  AutomationWorkflow,
  createAutomationCreatedEvent,
} from "../../domain";
import type { CreateAutomationDto } from "../dto";
import type { BusinessAutomationDependencies } from "../dependencies";

export class CreateAutomationUseCase {
  constructor(private readonly deps: BusinessAutomationDependencies) {}

  async execute(dto: CreateAutomationDto) {
    const workflow = AutomationWorkflow.create({
      organizationId: dto.organizationId,
      name: dto.workflow.name,
      description: dto.workflow.description,
      visualLayout: dto.workflow.visualLayout,
      nodes: dto.workflow.nodes,
      entryNodeId: dto.workflow.entryNodeId,
    });

    await this.deps.workflowRepository.save(workflow);

    for (const trigger of dto.workflow.triggers) {
      await this.deps.workflowRepository.saveTrigger(
        AutomationTrigger.create({
          organizationId: dto.organizationId,
          workflowId: workflow.id,
          type: trigger.type,
          name: trigger.name,
          config: trigger.config,
          active: trigger.active,
        }),
      );
      this.deps.triggerEngine.register(
        AutomationTrigger.create({
          organizationId: dto.organizationId,
          workflowId: workflow.id,
          type: trigger.type,
          name: trigger.name,
          config: trigger.config,
          active: trigger.active,
        }),
      );
    }

    for (const condition of dto.workflow.conditions) {
      await this.deps.workflowRepository.saveCondition(
        AutomationCondition.create({
          organizationId: dto.organizationId,
          workflowId: workflow.id,
          field: condition.field,
          operator: condition.operator,
          value: condition.value,
          logicalGroup: condition.logicalGroup,
        }),
      );
    }

    for (const action of dto.workflow.actions) {
      await this.deps.workflowRepository.saveAction(
        AutomationAction.create({
          organizationId: dto.organizationId,
          workflowId: workflow.id,
          type: action.type,
          name: action.name,
          config: action.config,
          order: action.order,
        }),
      );
    }

    const automation = Automation.create({
      organizationId: dto.organizationId,
      workflowId: workflow.id,
      name: dto.name,
      description: dto.description,
      module: dto.module,
      requiresApproval: dto.requiresApproval,
    });

    await this.deps.automationRepository.save(automation);
    await this.deps.eventDispatcher.publish(createAutomationCreatedEvent(automation));

    return { automation, workflow };
  }
}
