import { WorkflowNotFoundError } from "../../shared";
import {
  BusinessWorkflow,
  createWorkflowCompletedEvent,
  createWorkflowStartedEvent,
} from "../../domain";
import type { CompleteWorkflowDto, StartWorkflowDto } from "../dto";
import type { EnterpriseOsDependencies } from "../dependencies";

export class StartWorkflowUseCase {
  constructor(private readonly deps: EnterpriseOsDependencies) {}

  async execute(dto: StartWorkflowDto) {
    const workflow = BusinessWorkflow.create({
      organizationId: dto.organizationId,
      name: dto.name,
      description: dto.description,
      contextId: dto.contextId,
      steps: dto.steps.map((s) => ({ ...s, status: "pending" as const })),
    });

    const started = this.deps.workflowCoordinator.start(workflow);
    await this.deps.enterpriseRegistry.saveWorkflow(started);
    await this.deps.eventDispatcher.publish(createWorkflowStartedEvent(started));
    await this.deps.enterpriseEventBus.broadcast(createWorkflowStartedEvent(started));

    return started;
  }
}

export class CompleteWorkflowUseCase {
  constructor(private readonly deps: EnterpriseOsDependencies) {}

  async execute(dto: CompleteWorkflowDto) {
    const workflow = await this.deps.enterpriseRegistry.findWorkflowById(dto.workflowId);
    if (!workflow) throw new WorkflowNotFoundError(dto.workflowId);

    const result = await this.deps.workflowCoordinator.coordinate(workflow);
    await this.deps.enterpriseRegistry.saveWorkflow(result.workflow);
    await this.deps.eventDispatcher.publish(createWorkflowCompletedEvent(result.workflow));
    await this.deps.enterpriseEventBus.broadcast(createWorkflowCompletedEvent(result.workflow));

    return result;
  }
}
