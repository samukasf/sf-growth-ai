import { ExecutiveProjectNotFoundError } from "../../shared";
import {
  createProjectApprovedEvent,
  createProjectCompletedEvent,
  createProjectRejectedEvent,
  createProjectStartedEvent,
} from "../../domain";
import type {
  ApproveProjectDto,
  CompleteProjectDto,
  RejectProjectDto,
  StartProjectDto,
} from "../dto";
import type { ExecutiveProjectEngineDependencies } from "../dependencies";

export class ApproveProjectUseCase {
  constructor(private readonly deps: ExecutiveProjectEngineDependencies) {}

  async execute(dto: ApproveProjectDto) {
    const project = await this.deps.repository.findProjectById(dto.projectId);
    if (!project) throw new ExecutiveProjectNotFoundError(dto.projectId);

    const approved = project.approve();
    await this.deps.repository.saveProject(approved);
    await this.deps.eventDispatcher.publish(createProjectApprovedEvent(approved));

    const approvals = await this.deps.repository.findApprovals(project.companyId);
    const pending = approvals.find(
      (item) => item.projectId === project.id && item.status === "pending",
    );
    if (pending) {
      await this.deps.repository.saveApproval(this.deps.approvalWorkflow.approve(pending));
    }

    return approved;
  }
}

export class RejectProjectUseCase {
  constructor(private readonly deps: ExecutiveProjectEngineDependencies) {}

  async execute(dto: RejectProjectDto) {
    const project = await this.deps.repository.findProjectById(dto.projectId);
    if (!project) throw new ExecutiveProjectNotFoundError(dto.projectId);

    const rejected = project.reject();
    await this.deps.repository.saveProject(rejected);
    await this.deps.eventDispatcher.publish(createProjectRejectedEvent(rejected));

    const approvals = await this.deps.repository.findApprovals(project.companyId);
    const pending = approvals.find(
      (item) => item.projectId === project.id && item.status === "pending",
    );
    if (pending) {
      await this.deps.repository.saveApproval(this.deps.approvalWorkflow.reject(pending));
    }

    return rejected;
  }
}

export class StartProjectUseCase {
  constructor(private readonly deps: ExecutiveProjectEngineDependencies) {}

  async execute(dto: StartProjectDto) {
    const project = await this.deps.repository.findProjectById(dto.projectId);
    if (!project) throw new ExecutiveProjectNotFoundError(dto.projectId);

    const started = project.start();
    await this.deps.repository.saveProject(started);
    await this.deps.eventDispatcher.publish(createProjectStartedEvent(started));

    return started;
  }
}

export class CompleteProjectUseCase {
  constructor(private readonly deps: ExecutiveProjectEngineDependencies) {}

  async execute(dto: CompleteProjectDto) {
    const project = await this.deps.repository.findProjectById(dto.projectId);
    if (!project) throw new ExecutiveProjectNotFoundError(dto.projectId);

    const completed = project.complete();
    await this.deps.repository.saveProject(completed);
    await this.deps.eventDispatcher.publish(createProjectCompletedEvent(completed));

    return completed;
  }
}
